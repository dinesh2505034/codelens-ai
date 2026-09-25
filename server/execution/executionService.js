import { runRealPython } from './runners/pythonRunner.js';
import { runRealJava } from './runners/javaRunner.js';
import { runRealC } from './runners/cRunner.js';
import { runRealCpp } from './runners/cppRunner.js';
import { detectEnvironment, getLanguageCompiler } from './environment.js';

/**
 * ExecutionService: High-Level Unified Code Execution Engine
 * Enforces strict ground-truth accuracy: All results must come from
 * real compilers/interpreters or honest environment error diagnostics.
 */
export async function executeProgram(code, language = 'python', customInputs = '', options = {}) {
  if (!code || typeof code !== 'string') {
    return {
      error: 'EmptyCode',
      exitCode: 1,
      compilerOutput: 'Error: No source code provided for execution.',
      finalOutput: 'Error: No source code provided for execution.',
      steps: [],
      totalSteps: 0
    };
  }

  const lang = (language || 'python').toLowerCase().trim();

  // Route to the real runtime runner
  if (lang === 'python' || lang === 'py') {
    return await runRealPython(code, customInputs, options);
  }

  if (lang === 'java') {
    return await runRealJava(code, customInputs, options);
  }

  if (lang === 'c') {
    return await runRealC(code, customInputs, options);
  }

  if (lang === 'cpp' || lang === 'c++') {
    return await runRealCpp(code, customInputs, options);
  }

  // Unsupported language: Report honestly, NEVER fabricate!
  const supportedList = 'Python, Java, C, C++';
  const errorMsg = `Unsupported Language: '${language}'. CodeLens AI supports real execution for: ${supportedList}.`;
  return {
    error: 'UnsupportedLanguage',
    exitCode: 1,
    compilerOutput: errorMsg,
    finalOutput: errorMsg,
    steps: [{
      line: 1,
      lineCode: code.split('\n')[0] || '',
      variables: {},
      callStack: [{ frameName: 'Main', line: 1 }],
      output: errorMsg,
      hasError: true,
      errorType: 'UnsupportedLanguage',
      explanation: errorMsg,
      statusText: 'Execution aborted'
    }],
    totalSteps: 1
  };
}

export { detectEnvironment, getLanguageCompiler };
