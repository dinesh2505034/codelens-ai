import { generateStepTrace } from './services/universalTraceEngine.js';

async function runTests() {
  console.log('====================================================');
  console.log('Starting Synchronized Real Execution Test Suite...');
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
  });

  // 4. C Synchronized Step-by-Step Execution & Output
  await assert('C: Synchronized Step-by-Step Execution (swap.c)', async () => {
    const code = `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 42;
    int y = 99;
    
    printf("Before swap: x = %d, y = %d\\n", x, y);
    swap(&x, &y);
    printf("After swap: x = %d, y = %d\\n", x, y);
    
    return 0;
}`;
    const trace = await generateStepTrace(code, 'c');
    if (!trace.finalOutput.includes('Before swap: x = 42, y = 99') || !trace.finalOutput.includes('After swap: x = 99, y = 42')) {
      throw new Error(`Output missing expected strings: ${trace.finalOutput}`);
    }
    if (trace.steps.length < 5) {
      throw new Error(`Expected at least 5 synchronized steps, got ${trace.steps.length}`);
    }
    // Verify first step output is empty (output is synced, not dumped at step 1)
    if (trace.steps[0].output.trim() !== '') {
      throw new Error(`Step 1 output should be empty, got: "${trace.steps[0].output}"`);
    }
    // Verify final step has full output
    const lastStep = trace.steps[trace.steps.length - 1];
    if (!lastStep.output.includes('After swap: x = 99, y = 42')) {
      throw new Error(`Final step should include 'After swap', got: "${lastStep.output}"`);
    }
    console.log(`       -> C Trace: ${trace.steps.length} synchronized steps captured.`);
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
  });

  // 6. C++ Synchronized Step-by-Step Execution & Output (bubble_sort.cpp)
  await assert('C++: Synchronized Step-by-Step Execution (bubble_sort.cpp)', async () => {
    const code = `#include <iostream>
#include <vector>

int main() {
    int arr[] = {64, 34, 25, 12, 22};
    int n = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    std::cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    return 0;
}`;
    const trace = await generateStepTrace(code, 'cpp');
    if (!trace.finalOutput.includes('Sorted array: 12 22 25 34 64')) {
      throw new Error(`Expected sorted array in output, got: ${trace.finalOutput}`);
    }
    if (trace.steps.length < 15) {
      throw new Error(`Expected loop steps, got only ${trace.steps.length} steps`);
    }
    // Verify first step output is empty (synced output)
    if (trace.steps[0].output.trim() !== '') {
      throw new Error(`Step 1 output should be empty, got: "${trace.steps[0].output}"`);
    }
    console.log(`       -> C++ Trace: ${trace.steps.length} synchronized loop/swap steps captured.`);
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
  });

  // 8. Java Synchronized Step-by-Step Execution & Output (Factorial.java)
  await assert('Java: Synchronized Step-by-Step Execution (Factorial.java)', async () => {
    const code = `public class Factorial {
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int num = 4;
        int result = factorial(num);
        System.out.println("Factorial of " + num + " is: " + result);
    }
}`;
    const trace = await generateStepTrace(code, 'java');
    if (!trace.finalOutput.includes('Factorial of 4 is: 24')) {
      throw new Error(`Expected 'Factorial of 4 is: 24', got: ${trace.finalOutput}`);
    }
    if (trace.steps.length < 5) {
      throw new Error(`Expected recursive steps, got ${trace.steps.length}`);
    }
    // Verify step 1 has empty output (synced)
    if (trace.steps[0].output.trim() !== '') {
      throw new Error(`Step 1 output should be empty, got: "${trace.steps[0].output}"`);
    }
    console.log(`       -> Java Trace: ${trace.steps.length} synchronized recursion steps captured.`);
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
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
