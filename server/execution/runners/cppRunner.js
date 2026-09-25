import path from 'path';
import fs from 'fs';
import { createSandbox, cleanupSandbox, getSanitizedEnv, runProcessWithLimits } from '../sandbox.js';
import { getLanguageCompiler } from '../environment.js';
import { instrumentCpp } from '../instrumentation/cppInstrumenter.js';
import { parseInstrumentedTrace } from '../instrumentation/traceParser.js';

export async function runRealCpp(code, customInputs = '', options = {}) {
  const compilerInfo = getLanguageCompiler('cpp');
  if (!compilerInfo.supported || !compilerInfo.binPath) {
    return {
      error: 'CppCompilerNotFound',
      exitCode: 127,
      compilerOutput: 'Error: Neither G++ nor Clang++ is installed in this server environment.\nTo execute C++ programs, please install G++ or Clang++.',
      finalOutput: 'Error: C++ compiler not found in environment.',
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'main()', line: 1 }],
        output: 'Error: C++ compiler (g++/clang++) is not installed on this server.',
        hasError: true,
        errorType: 'EnvironmentError',
        explanation: '❌ Compiler Unavailable: C++ programs require G++ or Clang++ installed in the environment. The server has not detected g++ or clang++ in its PATH.'
      }],
      totalSteps: 1
    };
  }

  const sandboxDir = createSandbox('codelens-cpp-');
  try {
    const rawLines = code.split('\n');
    const sourceFileName = 'main.cpp';
    const binaryFileName = process.platform === 'win32' ? 'main.exe' : 'main.out';
    const sourceFilePath = path.join(sandboxDir, sourceFileName);
    const binaryFilePath = path.join(sandboxDir, binaryFileName);

    fs.writeFileSync(sourceFilePath, code, 'utf8');

    // Add compiler directory to PATH so g++ can invoke cc1plus, as, ld
    const compilerBinDir = path.dirname(compilerInfo.binPath);
    const env = getSanitizedEnv(sandboxDir);
    env.PATH = compilerBinDir + (process.platform === 'win32' ? ';' : ':') + (env.PATH || '');

    // 1. REAL COMPILATION OF ORIGINAL SOURCE VIA G++ / CLANG++
    const compileStartTime = Date.now();
    const compileArgs = ['-std=c++17', '-O0', '-g', sourceFileName, '-o', binaryFileName];
    const compileRes = await runProcessWithLimits(compilerInfo.binPath, compileArgs, {
      cwd: sandboxDir,
      env,
      timeoutMs: options.compileTimeoutMs || 10000
    });

    const compileTime = ((Date.now() - compileStartTime) / 1000).toFixed(3);

    // If original source has compilation/syntax error, report exact compiler output
    if (compileRes.exitCode !== 0 || !fs.existsSync(binaryFilePath)) {
      const stderr = compileRes.stderr.trim() || compileRes.stdout.trim() || 'Compilation failed';
      const compilerBanner = `[Compiling] ${compilerInfo.compiler || 'g++'} -std=c++17 main.cpp -o ${binaryFileName}\n\n${stderr}\n\n[Done] exited with code=${compileRes.exitCode} in ${compileTime} seconds`;

      let errorLine = 1;
      let errorMsg = 'Compilation error';
      const lineMatch = stderr.match(/main\.cpp:(\d+):(?:\d+:)?\s*error:\s*(.*)/i);
      if (lineMatch) {
        errorLine = Math.max(1, parseInt(lineMatch[1], 10));
        errorMsg = lineMatch[2];
      }

      return {
        error: 'CompilationError',
        exitCode: compileRes.exitCode || 1,
        executionTime: `${compileTime}s`,
        compilerOutput: compilerBanner,
        finalOutput: stderr,
        steps: [{
          line: errorLine,
          lineCode: rawLines[errorLine - 1] || code.split('\n')[0] || '',
          variables: {},
          callStack: [{ frameName: 'main()', line: errorLine }],
          output: stderr,
          hasError: true,
          errorType: 'CompilationError',
          explanation: `❌ C++ Compilation Error on line ${errorLine}: ${errorMsg}`,
          statusText: 'Compilation failed'
        }],
        totalSteps: 1
      };
    }

    // 2. SYNCHRONIZED EXECUTION VIA INSTRUMENTATION
    let synchronizedSteps = null;
    let synchronizedFinalOutput = '';

    try {
      const instrumentedCode = instrumentCpp(code);
      const instSrcName = 'inst_main.cpp';
      const instBinName = process.platform === 'win32' ? 'inst_main.exe' : 'inst_main.out';
      const instSrcPath = path.join(sandboxDir, instSrcName);
      const instBinPath = path.join(sandboxDir, instBinName);

      fs.writeFileSync(instSrcPath, instrumentedCode, 'utf8');

      const instCompRes = await runProcessWithLimits(compilerInfo.binPath, ['-std=c++17', '-O0', instSrcName, '-o', instBinName], {
        cwd: sandboxDir,
        env,
        timeoutMs: 10000
      });

      if (instCompRes.exitCode === 0 && fs.existsSync(instBinPath)) {
        await new Promise((r) => setTimeout(r, 60));
        const instRunRes = await runProcessWithLimits(instBinPath, [], {
          cwd: sandboxDir,
          env,
          input: customInputs || '',
          timeoutMs: options.timeoutMs || 4000
        });

        if (!instRunRes.timedOut && instRunRes.stdout) {
          const parsed = parseInstrumentedTrace(instRunRes.stdout, rawLines);
          if (parsed.steps && parsed.steps.length > 0) {
            synchronizedSteps = parsed.steps;
            synchronizedFinalOutput = parsed.finalOutput;
          }
        }
      }
    } catch (instErr) {
      // Fall through to original binary execution
    }

    // 3. EXECUTION OF ORIGINAL BINARY (Ground truth stdout/stderr & crash check)
    await new Promise((r) => setTimeout(r, 60));
    const runStartTime = Date.now();
    const timeoutMs = options.timeoutMs || 4000;
    const runCmd = process.platform === 'win32' ? binaryFilePath : `./${binaryFileName}`;

    const runRes = await runProcessWithLimits(runCmd, [], {
      cwd: sandboxDir,
      env,
      input: customInputs || '',
      timeoutMs
    });

    const runTime = ((Date.now() - runStartTime) / 1000).toFixed(3);

    if (runRes.timedOut) {
      const banner = `[Running] ${binaryFileName}\n\nExecution Timed Out (${timeoutMs / 1000}s limit exceeded).\nPossible infinite loop or blocked input stream.\n[Done] exited with code=-1 in ${runTime} seconds`;
      return {
        error: 'TimeoutError',
        exitCode: -1,
        executionTime: `${runTime}s`,
        compilerOutput: banner,
        finalOutput: banner,
        steps: [{
          line: 1,
          lineCode: rawLines[0] || '',
          variables: {},
          callStack: [{ frameName: 'main()', line: 1 }],
          output: banner,
          hasError: true,
          errorType: 'TimeoutError',
          explanation: 'Execution timed out. The program likely entered an infinite loop or exceeded CPU limit.'
        }],
        totalSteps: 1
      };
    }

    const rawStdout = runRes.stdout || '';
    const rawStderr = runRes.stderr || '';
    const fullOutput = rawStderr ? `${rawStdout}\n${rawStderr}`.trim() : rawStdout;
    const exitCode = runRes.exitCode;
    const banner = `[Running] ${binaryFileName}\n${fullOutput}\n\n[Done] exited with code=${exitCode} in ${runTime} seconds`;

    // Check for crash signals (e.g. Segfault)
    let runtimeError = null;
    if (exitCode !== 0) {
      if (runRes.signal === 'SIGSEGV' || exitCode === 3221225477 || exitCode === 139) {
        runtimeError = 'Segmentation Fault (SIGSEGV) - Attempted to access unallocated or restricted memory.';
      } else if (runRes.signal === 'SIGFPE' || exitCode === 3221225620 || exitCode === 136) {
        runtimeError = 'Floating Point Exception (SIGFPE) - Division by zero or arithmetic overflow.';
      } else {
        runtimeError = `Process terminated with exit code ${exitCode}${runRes.signal ? ` (Signal: ${runRes.signal})` : ''}`;
      }
    }

    // If synchronized steps are available, use them!
    if (synchronizedSteps && synchronizedSteps.length > 0) {
      const lastStep = synchronizedSteps[synchronizedSteps.length - 1];
      if (runtimeError) {
        lastStep.hasError = true;
        lastStep.errorType = 'RuntimeError';
        lastStep.errorMessage = runtimeError;
        lastStep.explanation = `❌ ${runtimeError}`;
        lastStep.statusText = `Terminated with error (exit code ${exitCode})`;
      } else {
        lastStep.explanation = 'Execution completed successfully.';
        lastStep.statusText = 'Execution finished';
      }

      return {
        steps: synchronizedSteps,
        totalSteps: synchronizedSteps.length,
        finalOutput: fullOutput || synchronizedFinalOutput,
        compilerOutput: banner,
        exitCode,
        executionTime: `${runTime}s`,
        error: runtimeError
      };
    }

    // Fallback: build steps from source lines
    const steps = [];
    let activeVars = {};
    for (let i = 0; i < rawLines.length; i++) {
      const lineNum = i + 1;
      const text = rawLines[i].trim();
      if (!text || text.startsWith('//') || text.startsWith('/*') || text === '{' || text === '}' || text.startsWith('#')) continue;

      const varDecl = text.match(/^(?:int|long|double|float|char|bool|string|auto)\s+([A-Za-z_]\w*)\s*=\s*([^;]+);/);
      if (varDecl) {
        const vName = varDecl[1];
        let vVal = varDecl[2].trim();
        if (vVal.startsWith('"') && vVal.endsWith('"')) vVal = vVal.slice(1, -1);
        activeVars[vName] = vVal;
      }

      steps.push({
        line: lineNum,
        lineCode: rawLines[i],
        variables: { ...activeVars },
        callStack: [{ frameName: 'main()', line: lineNum }],
        output: i === rawLines.length - 1 ? fullOutput : '',
        explanation: `Execute line ${lineNum}: ${text}`
      });
    }

    return {
      steps,
      totalSteps: steps.length,
      finalOutput: fullOutput,
      compilerOutput: banner,
      exitCode,
      executionTime: `${runTime}s`,
      error: runtimeError
    };
  } finally {
    cleanupSandbox(sandboxDir);
  }
}
