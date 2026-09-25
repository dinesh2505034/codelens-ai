import path from 'path';
import fs from 'fs';
import { createSandbox, cleanupSandbox, getSanitizedEnv, runProcessWithLimits } from '../sandbox.js';
import { getLanguageCompiler } from '../environment.js';
import { instrumentJava } from '../instrumentation/javaInstrumenter.js';
import { parseInstrumentedTrace } from '../instrumentation/traceParser.js';

export async function runRealJava(code, customInputs = '', options = {}) {
  const compilerInfo = getLanguageCompiler('java');
  if (!compilerInfo.supported || !compilerInfo.javacPath || !compilerInfo.javaPath) {
    return {
      error: 'JavaCompilerNotFound',
      exitCode: 127,
      compilerOutput: 'Error: Java Development Kit (javac/java) is not installed in this environment.\nPlease install JDK 17+ or ensure javac is in your system PATH.',
      finalOutput: 'Error: Java Development Kit (javac/java) is not installed in this environment.',
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'Main Block', line: 1 }],
        output: 'Error: Java Development Kit (javac/java) is not installed in this environment.',
        hasError: true,
        errorType: 'EnvironmentError',
        explanation: '❌ Compiler Unavailable: Java programs require the Java Development Kit (javac and java) installed on the system.'
      }],
      totalSteps: 1
    };
  }

  const sandboxDir = createSandbox('codelens-java-');
  try {
    const rawLines = code.split('\n');

    // Add javac / java bin folder to PATH so JVM can locate runtime dependencies
    const env = getSanitizedEnv(sandboxDir);
    const javaBinDir = path.dirname(compilerInfo.javacPath);
    env.PATH = javaBinDir + (process.platform === 'win32' ? ';' : ':') + (env.PATH || '');
    env.JAVA_HOME = path.dirname(javaBinDir);

    // Detect class name
    let className = 'Main';
    let wrappedCode = code;
    let lineOffset = 0;

    const classMatch = code.match(/(?:public\s+)?class\s+([A-Za-z_]\w*)/);
    if (classMatch) {
      className = classMatch[1];
      wrappedCode = code;
    } else {
      // Wrap bare snippet inside standard Main class
      className = 'Main';
      lineOffset = 2; // lines added before snippet
      wrappedCode = `import java.util.*;\npublic class Main {\n  public static void main(String[] args) throws Exception {\n${code}\n  }\n}\n`;
    }

    const sourceFileName = `${className}.java`;
    const sourceFilePath = path.join(sandboxDir, sourceFileName);
    fs.writeFileSync(sourceFilePath, wrappedCode, 'utf8');

    // 1. REAL COMPILATION OF ORIGINAL SOURCE VIA JAVAC
    const compileStartTime = Date.now();
    const compileRes = await runProcessWithLimits(compilerInfo.javacPath, [sourceFileName], {
      cwd: sandboxDir,
      env,
      timeoutMs: options.compileTimeoutMs || 8000
    });

    const compileTime = ((Date.now() - compileStartTime) / 1000).toFixed(3);

    if (compileRes.exitCode !== 0 || compileRes.stderr.includes('error:')) {
      const stderr = compileRes.stderr.trim();
      const compilerBanner = `[Compiling] javac ${sourceFileName}\n\n${stderr}\n\n[Done] exited with code=${compileRes.exitCode} in ${compileTime} seconds`;

      // Extract error line
      let errorLine = 1;
      let errorMsg = 'Compilation error';
      const lineMatch = stderr.match(new RegExp(`${className}\\.java:(\\d+):\\s*error:\\s*(.*)`));
      if (lineMatch) {
        const rawErrLine = parseInt(lineMatch[1], 10);
        errorLine = Math.max(1, rawErrLine - lineOffset);
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
          callStack: [{ frameName: `${className}.main()`, line: errorLine }],
          output: stderr,
          hasError: true,
          errorType: 'CompilationError',
          explanation: `❌ Java Compilation Error on line ${errorLine}: ${errorMsg}`,
          statusText: 'Compilation failed'
        }],
        totalSteps: 1
      };
    }

    // 2. SYNCHRONIZED EXECUTION VIA INSTRUMENTATION
    let synchronizedSteps = null;
    let synchronizedFinalOutput = '';

    try {
      const instrumentedCode = instrumentJava(wrappedCode);
      const instSandboxDir = createSandbox('codelens-javainst-');
      try {
        const instSourceFilePath = path.join(instSandboxDir, sourceFileName);
        fs.writeFileSync(instSourceFilePath, instrumentedCode, 'utf8');

        const instCompRes = await runProcessWithLimits(compilerInfo.javacPath, [sourceFileName], {
          cwd: instSandboxDir,
          env,
          timeoutMs: options.compileTimeoutMs || 8000
        });

        if (instCompRes.exitCode === 0 && !instCompRes.stderr.includes('error:')) {
          const instRunRes = await runProcessWithLimits(compilerInfo.javaPath, ['-Xmx128m', '-Dfile.encoding=UTF-8', className], {
            cwd: instSandboxDir,
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
      } finally {
        cleanupSandbox(instSandboxDir);
      }
    } catch (instErr) {
      // Fall through to original class execution
    }

    // 3. REAL EXECUTION VIA JAVA RUNTIME (Ground truth stdout/stderr & crash check)
    const runStartTime = Date.now();
    const timeoutMs = options.timeoutMs || 4000;
    const runRes = await runProcessWithLimits(compilerInfo.javaPath, ['-Xmx128m', '-Dfile.encoding=UTF-8', className], {
      cwd: sandboxDir,
      env,
      input: customInputs || '',
      timeoutMs
    });

    const runTime = ((Date.now() - runStartTime) / 1000).toFixed(3);

    if (runRes.timedOut) {
      const banner = `[Running] java ${className}\n\nExecution Timed Out (${timeoutMs / 1000}s limit exceeded).\nPossible infinite loop or blocked input stream.\n[Done] exited with code=-1 in ${runTime} seconds`;
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
          callStack: [{ frameName: `${className}.main()`, line: 1 }],
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
    const banner = `[Running] java ${className}\n${fullOutput}\n\n[Done] exited with code=${exitCode} in ${runTime} seconds`;

    // Check for runtime exceptions
    let runtimeError = null;
    let exceptionLine = null;
    if (exitCode !== 0 || rawStderr.includes('Exception in thread')) {
      const excMatch = fullOutput.match(/Exception in thread "[^"]*"\s+([\w.$]+:\s*.*)/);
      if (excMatch) {
        runtimeError = excMatch[1].split('\n')[0];
      } else {
        runtimeError = `Java process exited with code ${exitCode}`;
      }

      const lineMatch = fullOutput.match(new RegExp(`${className}\\.java:(\\d+)`));
      if (lineMatch) {
        const rawErrLine = parseInt(lineMatch[1], 10);
        exceptionLine = Math.max(1, rawErrLine - lineOffset);
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
      if (!text || text.startsWith('//') || text.startsWith('/*') || text === '{' || text === '}' || text.startsWith('import ') || text.startsWith('package ')) {
        continue;
      }

      const varDecl = text.match(/^(?:int|long|double|float|char|boolean|String)\s+([A-Za-z_]\w*)\s*=\s*([^;]+);/);
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
        callStack: [{ frameName: `${className}.main()`, line: lineNum }],
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
