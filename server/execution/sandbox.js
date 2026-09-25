import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';

export const DEFAULT_TIMEOUT_MS = 4000;
export const MAX_OUTPUT_BYTES = 512 * 1024; // 512 KB

/**
 * Creates an isolated scratch folder inside system tmpdir
 */
export function createSandbox(prefix = 'codelens-exec-') {
  const tmpRoot = os.tmpdir();
  const sandboxDir = fs.mkdtempSync(path.join(tmpRoot, prefix));
  return sandboxDir;
}

/**
 * Safely cleans up the sandbox directory and all generated binaries/temp files
 */
export function cleanupSandbox(sandboxDir) {
  if (!sandboxDir || typeof sandboxDir !== 'string') return;
  try {
    if (fs.existsSync(sandboxDir)) {
      fs.rmSync(sandboxDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  } catch (err) {
    console.warn(`[Sandbox Cleanup Warning] Could not remove ${sandboxDir}:`, err.message);
  }
}

/**
 * Strips all environment secrets (API keys, DB credentials, auth tokens)
 * Leaving only bare-minimum system paths required for compiler/runtime execution.
 */
export function getSanitizedEnv(customSandboxDir = null) {
  const cleanEnv = {};

  // Safe whitelist of system runtime variables
  const SAFE_KEYS = [
    'PATH',
    'Path',
    'SYSTEMROOT',
    'SystemRoot',
    'WINDIR',
    'windir',
    'COMSPEC',
    'ComSpec',
    'PATHEXT',
    'SystemDrive',
    'OS',
    'USERPROFILE',
    'HOMEDRIVE',
    'HOMEPATH',
    'JAVA_HOME',
    'LANG',
    'LC_ALL'
  ];

  for (const key of SAFE_KEYS) {
    if (process.env[key] !== undefined) {
      cleanEnv[key] = process.env[key];
    }
  }

  // Force temp directories to point to the isolated sandbox if provided
  if (customSandboxDir) {
    cleanEnv['TEMP'] = customSandboxDir;
    cleanEnv['TMP'] = customSandboxDir;
  }

  // Python UTF-8 & unbuffered mode
  cleanEnv['PYTHONIOENCODING'] = 'utf-8';
  cleanEnv['PYTHONUNBUFFERED'] = '1';

  return cleanEnv;
}

/**
 * Executes a sandboxed process with hard CPU timeout, process-tree kill, and output capping
 */
export function runProcessWithLimits(command, args, options = {}) {
  return new Promise(async (resolve) => {
    const cwd = options.cwd || os.tmpdir();
    const input = options.input !== undefined && options.input !== null ? String(options.input) : '';
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const maxBytes = options.maxOutputBytes || MAX_OUTPUT_BYTES;
    const env = options.env || getSanitizedEnv(cwd);

    const startTime = Date.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;
    let outputTruncated = false;
    let isSettled = false;

    let child = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        child = spawn(command, args, {
          cwd,
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
          windowsHide: true
        });
        break;
      } catch (spawnErr) {
        if (attempt < 4 && (spawnErr.code === 'UNKNOWN' || spawnErr.message.includes('UNKNOWN') || spawnErr.code === 'EBUSY' || spawnErr.code === 'EACCES')) {
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
          continue;
        }
        return resolve({
          stdout: '',
          stderr: `Failed to spawn process (${command}): ${spawnErr.message}`,
          exitCode: 127,
          signal: null,
          timedOut: false,
          outputTruncated: false,
          durationMs: 0
        });
      }
    }

    // Hard execution timeout timer
    const timer = setTimeout(() => {
      timedOut = true;
      if (child.pid && !isSettled) {
        treeKill(child.pid, 'SIGKILL', (killErr) => {
          if (killErr) {
            console.warn(`[TreeKill Warning PID ${child.pid}]`, killErr.message);
          }
        });
      }
    }, timeoutMs);

    // Stream input if present
    if (child.stdin) {
      try {
        if (input.length > 0) {
          child.stdin.write(input);
        }
        child.stdin.end();
      } catch (stdinErr) {
        // Child might have exited immediately
      }
    }

    // Capture stdout with size caps
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        if (outputTruncated) return;
        stdoutBuffer += chunk.toString('utf8');
        if (stdoutBuffer.length + stderrBuffer.length > maxBytes) {
          outputTruncated = true;
          stdoutBuffer += '\n[Execution Output Limit Reached (512KB) - Truncated]\n';
          if (child.pid) {
            treeKill(child.pid, 'SIGKILL');
          }
        }
      });
    }

    // Capture stderr with size caps
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        if (outputTruncated) return;
        stderrBuffer += chunk.toString('utf8');
        if (stdoutBuffer.length + stderrBuffer.length > maxBytes) {
          outputTruncated = true;
          stderrBuffer += '\n[Execution Output Limit Reached (512KB) - Truncated]\n';
          if (child.pid) {
            treeKill(child.pid, 'SIGKILL');
          }
        }
      });
    }

    child.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        stdout: stdoutBuffer,
        stderr: stderrBuffer ? `${stderrBuffer}\n${err.message}` : err.message,
        exitCode: 1,
        signal: null,
        timedOut: false,
        outputTruncated,
        durationMs: Date.now() - startTime
      });
    });

    child.on('close', (exitCode, signal) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        exitCode: timedOut ? -1 : (exitCode !== null ? exitCode : (signal ? 1 : 0)),
        signal,
        timedOut,
        outputTruncated,
        durationMs: Date.now() - startTime
      });
    });
  });
}
