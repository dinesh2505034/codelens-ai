import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createSandbox, cleanupSandbox, getSanitizedEnv, runProcessWithLimits } from '../sandbox.js';
import { getLanguageCompiler } from '../environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRACER_PY_PATH = path.resolve(__dirname, '../../services/pythonTracer.py');

export async function runRealPython(code, customInputs = '', options = {}) {
  const compilerInfo = getLanguageCompiler('python');
  if (!compilerInfo.supported || !compilerInfo.binPath) {
    return {
      error: 'PythonRuntimeNotFound',
      exitCode: 127,
      finalOutput: 'Error: Python interpreter not found in environment.',
      compilerOutput: 'Error: Python interpreter not found in environment.',
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'Main Block', line: 1 }],
        output: 'Error: Python interpreter not found in environment.',
        hasError: true,
        errorType: 'EnvironmentError',
        explanation: 'The Python interpreter is not installed or accessible in this environment.'
      }],
      totalSteps: 1
    };
  }

  const sandboxDir = createSandbox('codelens-py-');
  try {
    const payload = JSON.stringify({
      code,
      customInputs: customInputs || ''
    });

    const env = getSanitizedEnv(sandboxDir);
    const timeoutMs = options.timeoutMs || 4500;

    const result = await runProcessWithLimits(compilerInfo.binPath, [TRACER_PY_PATH], {
      cwd: sandboxDir,
      input: payload,
      timeoutMs,
      env
    });

    if (result.timedOut) {
      const banner = `[Running] python -u "main.py"\n\nExecution Timed Out (${timeoutMs / 1000}s limit exceeded).\nPossible infinite loop or blocked input stream.\n[Done] exited with code=-1`;
      return {
        error: 'TimeoutError',
        exitCode: -1,
        executionTime: `${timeoutMs / 1000}s`,
        compilerOutput: banner,
        finalOutput: banner,
        steps: [{
          line: 1,
          lineCode: code.split('\n')[0] || '',
          variables: {},
          callStack: [{ frameName: 'Main Block', line: 1 }],
          output: banner,
          hasError: true,
          errorType: 'TimeoutError',
          explanation: 'Execution timed out. The program likely entered an infinite loop or exceeded the CPU limit.'
        }],
        totalSteps: 1
      };
    }

    if (result.stdout) {
      try {
        const parsed = JSON.parse(result.stdout);
        return parsed;
      } catch (parseErr) {
        // Output might contain stdout + stderr
      }
    }

    // Fallback if tracer process failed unexpectedly
    const combinedOutput = (result.stderr || result.stdout || 'Python process terminated unexpectedly').trim();
    return {
      error: 'RuntimeError',
      exitCode: result.exitCode || 1,
      executionTime: `${(result.durationMs / 1000).toFixed(3)}s`,
      compilerOutput: combinedOutput,
      finalOutput: combinedOutput,
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'Main Block', line: 1 }],
        output: combinedOutput,
        hasError: true,
        errorType: 'RuntimeError',
        explanation: combinedOutput
      }],
      totalSteps: 1
    };
  } finally {
    cleanupSandbox(sandboxDir);
  }
}
