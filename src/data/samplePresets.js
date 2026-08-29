export const SAMPLE_PRESETS = [
  {
    id: 'py-reverse-num',
    title: 'Reverse an Integer (Screenshot Example)',
    language: 'python',
    filename: 'main.py',
    category: 'Math & Modulo',
    description: 'Reverses digits of an integer step-by-step using modulo and integer floor division.',
    code: `num = 12345
reversed_num = 0

while num != 0:
    digit = num % 10
    reversed_num = reversed_num * 10 + digit
    num //= 10

print("Reversed Number:", reversed_num)`
  },
  {
    id: 'cpp-bubble-sort',
    title: 'Bubble Sort with Array Visualization',
    language: 'cpp',
    filename: 'bubble_sort.cpp',
    category: 'Sorting & Arrays',
    description: 'Visual step-by-step adjacent element comparisons and in-place swaps.',
    code: `#include <iostream>
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
    return 0;
}`
  },
  {
    id: 'py-binary-search',
    title: 'Binary Search (Logarithmic Division)',
    language: 'python',
    filename: 'binary_search.py',
    category: 'Search & Divide-and-Conquer',
    description: 'Finds a target in a sorted list by repeatedly halving the search interval.',
    code: `arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23

low = 0
high = len(arr) - 1
found_index = -1

while low <= high:
    mid = (low + high) // 2
    if arr[mid] == target:
        found_index = mid
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

print("Target found at index:", found_index)`
  },
  {
    id: 'py-fibonacci',
    title: 'Fibonacci Sequence Generator',
    language: 'python',
    filename: 'fibonacci.py',
    category: 'Dynamic Computation',
    description: 'Generates Fibonacci terms using iterative two-variable shifting.',
    code: `a = 0
b = 1
n = 7
sequence = [a, b]

for i in range(2, n + 1):
    next_val = a + b
    sequence.append(next_val)
    a, b = b, next_val

print("Fibonacci sequence:", sequence)`
  },
  {
    id: 'py-two-sum',
    title: 'Two Sum (Hash Map O(N))',
    language: 'python',
    filename: 'two_sum.py',
    category: 'Hash Tables',
    description: 'Finds indices of two numbers that add up to target in O(N) linear time.',
    code: `nums = [2, 7, 11, 15]
target = 9
seen = {}
result = []

for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        result = [seen[complement], i]
        break
    seen[num] = i

print("Matching indices:", result)`
  },
  {
    id: 'java-factorial',
    title: 'Factorial Recursion Call Stack',
    language: 'java',
    filename: 'Factorial.java',
    category: 'Recursion & Call Stack',
    description: 'Calculates factorial of a number while building and unwinding call stack frames.',
    code: `public class Factorial {
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
}`
  },
  {
    id: 'c-pointer-swap',
    title: 'C Pointer Memory Swapping',
    language: 'c',
    filename: 'swap.c',
    category: 'Pointers & Memory',
    description: 'Passes memory addresses to swap two integer variables via dereferencing.',
    code: `#include <stdio.h>

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
}`
  },
  {
    id: 'py-buggy-example',
    title: 'Buggy Python Code (Test AI Debugger)',
    language: 'python',
    filename: 'buggy.py',
    category: 'AI Debugging',
    description: 'Contains missing colons and float division bugs for testing 1-click AI auto-repair.',
    code: `num = 12345
reversed_num = 0

while num != 0
    digit = num % 10
    reversed_num = reversed_num * 10 + digit
    num /= 10

print("Reversed Number:", reversed_num)`
  },
  {
    id: 'cpp-buggy-example',
    title: 'Buggy C++ Code (Test AI Debugger)',
    language: 'cpp',
    filename: 'buggy.cpp',
    category: 'AI Debugging',
    description: 'Contains missing semicolons and uninitialized variables for testing 1-click AI repair.',
    code: `int main() {
    int a = 10
    int b = 20;
    int sum = a + b
    return 0
}`
  }
];
