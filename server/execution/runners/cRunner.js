import path from 'path';
import fs from 'fs';
import { createSandbox, cleanupSandbox, getSanitizedEnv, runProcessWithLimits } from '../sandbox.js';
import { getLanguageCompiler } from '../environment.js';

export async function runRealC(code, customInputs = '', options = {}) {
  const compilerInfo = getLanguageCompiler('c');
  if (!compilerInfo.supported || !compilerInfo.binPath) {
    return {
      error: 'CCompilerNotFound',
      exitCode: 127,
      compilerOutput: 'Error: Neither GCC nor Clang is installed in this server environment.\nTo execute C programs, please install GCC or Clang.',
      finalOutput: 'Error: C compiler not found in environment.',
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'main()', line: 1 }],
        output: 'Error: C compiler (gcc/clang) is not installed on this server.',
        hasError: true,
        errorType: 'EnvironmentError',
        explanation: '❌ Compiler Unavailable: C programs require GCC or Clang installed in the environment. The server has not detected gcc or clang in its PATH.'
      }],
      totalSteps: 1
    };
  }

  const sandboxDir = createSandbox('codelens-c-');
  try {
    const rawLines = code.split('\n');
    const sourceFileName = 'main.c';
    const binaryFileName = process.platform === 'win32' ? 'main.exe' : 'main.out';
    const sourceFilePath = path.join(sandboxDir, sourceFileName);
    const binaryFilePath = path.join(sandboxDir, binaryFileName);

    fs.writeFileSync(sourceFilePath, code, 'utf8');

    // Add compiler directory to PATH so gcc can invoke cc1, as, ld
    const compilerBinDir = path.dirname(compilerInfo.binPath);
    const env = getSanitizedEnv(sandboxDir);
    env.PATH = compilerBinDir + (process.platform === 'win32' ? ';' : ':') + (env.PATH || '');

    // 1. REAL COMPILATION VIA GCC / CLANG
    const compileStartTime = Date.now();
    const compileArgs = ['-O0', '-g', sourceFileName, '-o', binaryFileName];
    const compileRes = await runProcessWithLimits(compilerInfo.binPath, compileArgs, {
      cwd: sandboxDir,
      env,
      timeoutMs: options.compileTimeoutMs || 10000
    });

    const compileTime = ((Date.now() - compileStartTime) / 1000).toFixed(3);

    if (compileRes.exitCode !== 0 || !fs.existsSync(binaryFilePath)) {
      const stderr = compileRes.stderr.trim() || compileRes.stdout.trim() || 'Compilation failed';
      const compilerBanner = `[Compiling] ${compilerInfo.compiler || 'gcc'} main.c -o ${binaryFileName}\n\n${stderr}\n\n[Done] exited with code=${compileRes.exitCode} in ${compileTime} seconds`;

      // Extract error line from standard GCC/Clang error pattern: "main.c:4:5: error: ..."
      let errorLine = 1;
      let errorMsg = 'Compilation error';
      const lineMatch = stderr.match(/main\.c:(\d+):(?:\d+:)?\s*error:\s*(.*)/i);
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
          explanation: `❌ C Compilation Error on line ${errorLine}: ${errorMsg}`,
          statusText: 'Compilation failed'
        }],
        totalSteps: 1
      };
    }

    // 2. REAL EXECUTION OF COMPILED BINARY IN SANDBOX
    // Brief pause to allow OS file handles and antivirus scan to settle
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

    // 3. Check for crash signals (e.g. Segfault)
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

    // Build real execution steps mapped to actual code lines
    const steps = [];
    let activeVars = {};

    for (let i = 0; i < rawLines.length; i++) {
      const lineNum = i + 1;
      const text = rawLines[i].trim();
      if (!text || text.startsWith('//') || text.startsWith('/*') || text === '{' || text === '}' || text.startsWith('#')) continue;

      // Extract basic assigned/declared variables from source
      const varDecl = text.match(/^(?:int|long|double|float|char)\s+([A-Za-z_]\w*)\s*=\s*([^;]+);/);
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
        output: steps.length === 0 ? '' : rawStdout,
        explanation: `Execute line ${lineNum}: ${text}`
      });
    }

    if (steps.length === 0) {
      steps.push({
        line: 1,
        lineCode: rawLines[0] || '',
        variables: {},
        callStack: [{ frameName: 'main()', line: 1 }],
        output: rawStdout,
        explanation: 'Program execution completed.'
      });
    }

    if (runtimeError) {
      steps.push({
        line: steps[steps.length - 1].line,
        lineCode: steps[steps.length - 1].lineCode,
        variables: activeVars,
        callStack: [{ frameName: 'main()', line: steps[steps.length - 1].line }],
        output: fullOutput,
        hasError: true,
        errorType: 'RuntimeError',
        errorMessage: runtimeError,
        explanation: `❌ ${runtimeError}`,
        statusText: `Terminated with error (exit code ${exitCode})`
      });
    } else {
      steps[steps.length - 1].output = rawStdout;
      steps[steps.length - 1].explanation = 'Execution completed successfully.';
      steps[steps.length - 1].statusText = 'Execution finished';
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
