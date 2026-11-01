const BASE_URL = 'https://codelens-ai-sefe.onrender.com';

async function runLiveTests() {
  console.log('====================================================');
  console.log(`Testing Live CodeLens AI at: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      console.log(`[STARTING] ${name}...`);
      await fn();
      console.log(`[PASS] ${name}\n`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}\n`);
      failed++;
    }
  }

  // 1. Health & Environment Inspection
  await assertTest('1. Health & Compiler Runtimes', async () => {
    const res = await fetch(`${BASE_URL}/api/runtimes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const r = data.runtimes;
    if (!r.python.available) throw new Error('Python not available');
    if (!r.c.available) throw new Error('C (gcc) not available');
    if (!r.cpp.available) throw new Error('C++ (g++) not available');
    if (!r.java.available) throw new Error('Java (javac) not available');
    console.log(`       Python: ${r.python.version}`);
    console.log(`       C: ${r.c.version}`);
    console.log(`       C++: ${r.cpp.version}`);
    console.log(`       Java: ${r.java.version} (${r.java.javacPath})`);
  });

  // 2. Python Stdin + Dynamic 7-Point Error Diagnostic
  await assertTest('2. Python: ValueError Dynamic 7-Point Diagnostic', async () => {
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'l = int(input())\nprint(f"Value: {l}")',
        language: 'python',
        customInputs: 'd'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const lastStep = data.steps[data.steps.length - 1];
    if (!lastStep.hasError || lastStep.errorType !== 'ValueError') {
      throw new Error(`Expected ValueError, got: ${JSON.stringify(lastStep)}`);
    }
    if (!lastStep.errorDiagnostic || !lastStep.errorDiagnostic.summary) {
      throw new Error('Missing 7-point errorDiagnostic');
    }
    console.log(`       Captured: ${lastStep.errorDiagnostic.summary}`);
    console.log(`       Fix Suggestion: ${lastStep.errorDiagnostic.suggestion}`);
  });

  // 3. Java: Factorial Recursion Call Stack & Output
  await assertTest('3. Java: Factorial Recursion (Factorial.java)', async () => {
    const javaCode = `public class Factorial {
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
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: javaCode, language: 'java' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.finalOutput || !data.finalOutput.includes('Factorial of 4 is: 24')) {
      throw new Error(`Expected 'Factorial of 4 is: 24', got: "${data.finalOutput}"`);
    }
    if (!data.steps || data.steps.length < 5) {
      throw new Error(`Expected at least 5 steps, got ${data.steps?.length}`);
    }
    console.log(`       Captured ${data.steps.length} recursive execution steps.`);
    console.log(`       Final Output: ${data.finalOutput.trim()}`);
  });

  // 4. C: Pointer Swap Memory Execution & Output Sync
  await assertTest('4. C: Pointer Swap Memory Execution', async () => {
    const cCode = `#include <stdio.h>

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
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cCode, language: 'c' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.finalOutput.includes('Before swap: x = 42, y = 99') || !data.finalOutput.includes('After swap: x = 99, y = 42')) {
      throw new Error(`Output missing expected strings: "${data.finalOutput}"`);
    }
    if (data.steps.length < 5) {
      throw new Error(`Expected >= 5 steps, got ${data.steps.length}`);
    }
    console.log(`       Captured ${data.steps.length} synchronized C steps.`);
    console.log(`       Final Output:\n${data.finalOutput.trim()}`);
  });

  // 5. C++: Bubble Sort Loop Stepping & Verification
  await assertTest('5. C++: Bubble Sort Array Iteration', async () => {
    const cppCode = `#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {5, 2, 8, 1};
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    std::cout << "Sorted: ";
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    return 0;
}`;
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cppCode, language: 'cpp' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.finalOutput.includes('Sorted: 1 2 5 8')) {
      throw new Error(`Expected 'Sorted: 1 2 5 8 ', got: "${data.finalOutput}"`);
    }
    console.log(`       Captured ${data.steps.length} loop iteration steps.`);
    console.log(`       Final Output: ${data.finalOutput.trim()}`);
  });

  // 6. Java: Real Compiler Syntax Error Detection
  await assertTest('6. Java: Javac Syntax Error Diagnostic', async () => {
    const badJava = `public class Broken {
    public static void main(String[] args) {
        int x = 10
        System.out.println(x);
    }
}`;
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: badJava, language: 'java' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error !== 'CompilationError') {
      throw new Error(`Expected CompilationError, got: ${data.error}`);
    }
    console.log(`       Real Javac Error caught on line ${data.steps[0].line}: ${data.steps[0].output.trim().split('\n')[0]}`);
  });

  // 7. C: Real GCC Syntax Error Detection
  await assertTest('7. C: GCC Syntax Error Diagnostic', async () => {
    const badC = `#include <stdio.h>
int main() {
    int a = 10
    return 0;
}`;
    const res = await fetch(`${BASE_URL}/api/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: badC, language: 'c' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error !== 'CompilationError') {
      throw new Error(`Expected CompilationError, got: ${data.error}`);
    }
    console.log(`       Real GCC Error caught on line ${data.steps[0].line}: ${data.steps[0].output.trim().split('\n')[0]}`);
  });

  // 8. Frontend Assets & Web UI Load Check
  await assertTest('8. Frontend Web Client Bundle Verification', async () => {
    const pageRes = await fetch(BASE_URL);
    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
    const html = await pageRes.text();
    if (!html.includes('<div id="root"></div>') && !html.includes('id="root"')) {
      throw new Error('index.html missing root element');
    }
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!jsMatch) throw new Error('Could not find frontend JS bundle in HTML');
    const jsRes = await fetch(`${BASE_URL}${jsMatch[1]}`);
    if (!jsRes.ok) throw new Error(`JS bundle failed to load: HTTP ${jsRes.status}`);
    console.log(`       Frontend HTML & JS bundle loaded cleanly (${(jsRes.headers.get('content-length') / 1024).toFixed(1)} KB)`);
  });

  console.log('====================================================');
  console.log(`Comprehensive Live Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
}

runLiveTests();
