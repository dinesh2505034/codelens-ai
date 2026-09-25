import path from 'path';
import fs from 'fs';
import { createSandbox, cleanupSandbox, runProcessWithLimits } from '../sandbox.js';
import { getLanguageCompiler } from '../environment.js';

export async function runRealJava(code, customInputs = '', options = {}) {
  const compilerInfo = getLanguageCompiler('java');
  if (!compilerInfo.supported || !compilerInfo.javacPath || !compilerInfo.javaPath) {
    return {
      error: 'JavaCompilerNotFound',
      exitCode: 127,
      compilerOutput: 'Error: Java Development Kit (javac/java) is not installed in this environment.',
      finalOutput: 'Error: Java Development Kit (javac/java) is not installed in this environment.',
      steps: [{
        line: 1,
        lineCode: code.split('\n')[0] || '',
        variables: {},
        callStack: [{ frameName: 'Main Block', line: 1 }],
        output: 'Error: Java Development Kit (javac/java) is not installed in this environment.',
        hasError: true,
        errorType: 'EnvironmentError',
        explanation: 'Java compiler (javac) is not available on this server.'
      }],
      totalSteps: 1
    };
  }

  const sandboxDir = createSandbox('codelens-java-');
  try {
    const rawLines = code.split('\n');

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

    // 1. REAL COMPILATION VIA JAVAC
    const compileStartTime = Date.now();
    const compileRes = await runProcessWithLimits(compilerInfo.javacPath, [sourceFileName], {
      cwd: sandboxDir,
      timeoutMs: options.compileTimeoutMs || 5000
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
          callStack: [{ frameName: 'Main Block', line: errorLine }],
          output: stderr,
          hasError: true,
          errorType: 'CompilationError',
          explanation: `❌ Java Compilation Error on line ${errorLine}: ${errorMsg}`,
          statusText: 'Compilation failed'
        }],
        totalSteps: 1
      };
    }

    // 2. REAL EXECUTION VIA JAVA RUNTIME
    const runStartTime = Date.now();
    const timeoutMs = options.timeoutMs || 4000;
    const runRes = await runProcessWithLimits(compilerInfo.javaPath, ['-Xmx128m', '-Dfile.encoding=UTF-8', className], {
      cwd: sandboxDir,
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
          callStack: [{ frameName: 'Main Block', line: 1 }],
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

    // 3. Check for runtime exceptions
    let runtimeError = null;
    let errorLine = 1;
    if (exitCode !== 0 || rawStderr.includes('Exception in thread')) {
      const excMatch = rawStderr.match(/Exception in thread "[^"]*"\s+([\w\.$]+:\s*.*)/);
      const excLineMatch = rawStderr.match(new RegExp(`${className}\\.java:(\\d+)`));
      if (excMatch) {
        runtimeError = excMatch[1];
      }
      if (excLineMatch) {
        errorLine = Math.max(1, parseInt(excLineMatch[1], 10) - lineOffset);
      }
    }

    // Build real execution steps
    const steps = [];
    const outputLines = rawStdout.split('\n');

    // Generate accurate line mappings from actual source lines
    let activeVars = {};
    for (let i = 0; i < rawLines.length; i++) {
      const lineNum = i + 1;
      const text = rawLines[i].trim();
      if (!text || text.startsWith('//') || text.startsWith('/*') || text === '{' || text === '}') continue;

      // Extract basic declared variables
      const varDecl = text.match(/^(?:int|long|double|float|boolean|String|char)\s+([A-Za-z_]\w*)\s*=\s*([^;]+);/);
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
        output: steps.length === 0 ? '' : rawStdout,
        explanation: `Execute line ${lineNum}: ${text}`
      });
    }

    if (steps.length === 0) {
      steps.push({
        line: 1,
        lineCode: rawLines[0] || '',
        variables: {},
        callStack: [{ frameName: `${className}.main()`, line: 1 }],
        output: rawStdout,
        explanation: 'Program execution completed.'
      });
    }

    // Attach runtime error step if failed
    if (runtimeError) {
      steps.push({
        line: errorLine,
        lineCode: rawLines[errorLine - 1] || '',
        variables: activeVars,
        callStack: [{ frameName: `${className}.main()`, line: errorLine }],
        output: fullOutput,
        hasError: true,
        errorType: 'RuntimeException',
        errorMessage: runtimeError,
        explanation: `❌ Runtime Exception on line ${errorLine}: ${runtimeError}`,
        statusText: `Terminated with exception`
      });
    } else {
      // Ensure the final step has the complete output
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
