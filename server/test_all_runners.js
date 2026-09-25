import { executeProgram } from './execution/executionService.js';
import { generateStepTrace } from './services/universalTraceEngine.js';

async function runTests() {
  console.log('====================================================');
  console.log('Starting Ground-Truth Real Execution Test Suite...');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Python Success
  await assert('Python: Basic Execution', async () => {
    const code = 'a = 10\nb = 20\nprint(f"Sum={a+b}")';
    const trace = await generateStepTrace(code, 'python');
    if (!trace.finalOutput.includes('Sum=30')) {
      throw new Error(`Expected 'Sum=30', got: ${trace.finalOutput}`);
    }
    if (trace.steps.length === 0) throw new Error('No steps generated');
  });

  // 2. Python Stdin + Int Input
  await assert('Python: Stdin input processing', async () => {
    const code = 'val = int(input())\nprint(f"Squared={val*val}")';
    const trace = await generateStepTrace(code, 'python', '7');
    if (!trace.finalOutput.includes('Squared=49')) {
      throw new Error(`Expected 'Squared=49', got: ${trace.finalOutput}`);
    }
  });

  // 3. Python Stdin Invalid Literal (ValueError 7-point diagnostic)
  await assert('Python: Invalid Literal Error Diagnostic', async () => {
    const code = 'l = int(input())\nprint("Done")';
    const trace = await generateStepTrace(code, 'python', 'd');
    const lastStep = trace.steps[trace.steps.length - 1];
    if (!lastStep.hasError || lastStep.errorType !== 'ValueError') {
      throw new Error(`Expected ValueError, got: ${JSON.stringify(lastStep)}`);
    }
    if (!lastStep.errorDiagnostic || !lastStep.errorDiagnostic.summary) {
      throw new Error('Missing errorDiagnostic in step');
    }
    console.log('       -> Python Diagnostic:', lastStep.errorDiagnostic.summary);
  });

  // 4. C Success
  await assert('C: Real GCC Compilation & Execution', async () => {
    const code = `#include <stdio.h>
int main() {
    int x = 15;
    int y = 27;
    printf("Result: %d\\n", x + y);
    return 0;
}`;
    const trace = await generateStepTrace(code, 'c');
    if (!trace.finalOutput.includes('Result: 42')) {
      throw new Error(`Expected 'Result: 42', got: ${trace.finalOutput}`);
    }
  });

  // 5. C Syntax Error
  await assert('C: Real GCC Syntax Error Detection', async () => {
    const code = `#include <stdio.h>
int main() {
    int x = 10
    return 0;
}`;
    const trace = await generateStepTrace(code, 'c');
    if (!trace.steps[0].hasError || trace.steps[0].errorType !== 'CompilationError') {
      throw new Error(`Expected CompilationError, got: ${JSON.stringify(trace)}`);
    }
    console.log('       -> C Error Caught:', trace.steps[0].explanation);
  });

  // 6. C++ Success
  await assert('C++: Real G++ Compilation & Execution', async () => {
    const code = `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "Vector Total: " << total << std::endl;
    return 0;
}`;
    const trace = await generateStepTrace(code, 'cpp');
    if (!trace.finalOutput.includes('Vector Total: 15')) {
      throw new Error(`Expected 'Vector Total: 15', got: ${trace.finalOutput}`);
    }
  });

  // 7. C++ Syntax Error
  await assert('C++: Real G++ Syntax Error Detection', async () => {
    const code = `int main() {
    int a = 10
    int b = 20;
    return 0
}`;
    const trace = await generateStepTrace(code, 'cpp');
    if (!trace.steps[0].hasError || trace.steps[0].errorType !== 'CompilationError') {
      throw new Error(`Expected CompilationError, got: ${JSON.stringify(trace)}`);
    }
    console.log('       -> C++ Error Caught:', trace.steps[0].explanation);
  });

  // 8. Java Success
  await assert('Java: Real Javac Compilation & Execution', async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        int a = 21;
        System.out.println("Java Value: " + (a * 2));
    }
}`;
    const trace = await generateStepTrace(code, 'java');
    if (!trace.finalOutput.includes('Java Value: 42')) {
      throw new Error(`Expected 'Java Value: 42', got: ${trace.finalOutput}`);
    }
  });

  // 9. Java Compilation Error
  await assert('Java: Real Javac Compilation Error Detection', async () => {
    const code = `public class Main {
    public static void main(String[] args) {
        int a = 21
    }
}`;
    const trace = await generateStepTrace(code, 'java');
    if (!trace.steps[0].hasError || trace.steps[0].errorType !== 'CompilationError') {
      throw new Error(`Expected CompilationError, got: ${JSON.stringify(trace)}`);
    }
    console.log('       -> Java Error Caught:', trace.steps[0].explanation);
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
