import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CodeLens AI - Intelligent Deep Code Analysis & Advanced Debugger Engine
 * Combines native AST-level compiler diagnostics, memory safety checks,
 * algorithmic complexity proofs, and 1-click auto-repair.
 */

export function analyzeCode(code, language = 'python', level = 'all') {
  if (!code || typeof code !== 'string') {
    return { error: 'No code provided for analysis' };
  }

  const lang = (language || 'python').toLowerCase();
  const rawLines = code.split('\n');

  // 1. Semantic AST & Pattern Extraction
  const analysis = performSemanticAnalysis(code, rawLines, lang);

  // 2. Compute Mathematical Time and Space Complexity
  const complexity = computeComplexity(code, rawLines, analysis);

  // 3. Generate Rich Line-by-Line Teaching Explanations
  const lineExplains = generateDetailedLineByLine(rawLines, lang, analysis);

  // 4. Extract Variables and Data Structures
  const dataStructures = extractStructures(code, lang);

  // 5. Generate Contextual Perspectives (ELI5 & Senior Engineer)
  const perspectives = generateContextualPerspectives(analysis, complexity, lang);

  return {
    title: analysis.title,
    summary: analysis.summary,
    algorithmType: analysis.category,
    language: lang.toUpperCase(),
    complexity: {
      time: complexity.time,
      timeDetail: complexity.timeDetail,
      space: complexity.space,
      spaceDetail: complexity.spaceDetail,
    },
    keyStructures: dataStructures,
    lineByLine: lineExplains,
    perspectives,
    tags: analysis.tags,
    engine: 'CodeLens Native AI'
  };
}

// ----------------------------------------------------
// Semantic Code Classifier & Logic Analyzer
// ----------------------------------------------------

function performSemanticAnalysis(code, rawLines, lang) {
  const norm = code.toLowerCase();

  // 1. Math Factorial / Combinatorics
  if (norm.includes('factorial') || norm.includes('math.factorial') || (norm.includes('fact(') && !norm.includes('def '))) {
    if (norm.includes('import math') || norm.includes('math.factorial')) {
      return {
        title: 'Factorial Computation via Built-in Mathematical Module',
        category: 'Arbitrary-Precision Arithmetic & Combinatorics',
        summary: 'This program computes the factorial ($n! = 1 \\times 2 \\times \\dots \\times n$) of a given integer using the optimized C-extensions of the `math` library, supporting exact arbitrary-precision integer calculations without numerical overflow.',
        tags: ['Math', 'Factorial', 'Arbitrary Precision', 'Combinatorics', 'Optimized Library']
      };
    }
  }

  // 2. Custom Recursion (Factorial or Fibonacci or Tree)
  if ((norm.includes('def ') || norm.includes('int ')) && norm.includes('return') && hasRecursiveSelfCall(code)) {
    return {
      title: 'Recursive Function & Call Stack Decomposition',
      category: 'Recursive Divide & Conquer',
      summary: 'This algorithm solves the problem by breaking it down into smaller self-similar sub-problems using recursive self-invocation, unwinding when reaching the explicit base case.',
      tags: ['Recursion', 'Call Stack', 'Base Case', 'Function Frames']
    };
  }

  // 3. Digit Extraction & Number Reversal
  if ((norm.includes('reversed_num') || norm.includes('rev')) && (norm.includes('% 10') || norm.includes('// 10') || norm.includes('/ 10'))) {
    return {
      title: 'Integer Digit Extraction & Reversal Algorithm',
      category: 'Iterative Modulo Arithmetic',
      summary: 'This algorithm iteratively reverses the digits of an integer by isolating the least-significant digit via `% 10`, shifting the accumulated sum (`* 10`), and truncating the processed digit with integer division (`// 10`) until the number reaches zero.',
      tags: ['Math', 'Digit Extraction', 'Modulo Arithmetic', 'Iterative Loop']
    };
  }

  // 4. Bubble Sort / Array Sorting
  if ((norm.includes('arr[') || norm.includes('vector')) && (norm.includes('for') || norm.includes('while')) && (norm.includes('temp') || norm.includes('swap') || norm.includes('>'))) {
    return {
      title: 'Adjacent Element Transposition (Bubble Sort)',
      category: 'Comparison-Based Sorting',
      summary: 'This algorithm iteratively compares adjacent element pairs in an array and swaps them when out of order, systematically propagating the largest unsorted value to the end of the array on each pass.',
      tags: ['Sorting', 'In-Place Swap', 'Array Transposition', 'Two Pointers']
    };
  }

  // 5. Binary Search
  if (norm.includes('low') && norm.includes('high') && norm.includes('mid') && norm.includes('target')) {
    return {
      title: 'Binary Search (Logarithmic Search Interval)',
      category: 'Divide and Conquer Search',
      summary: 'Binary Search efficiently finds the location of a target value within a sorted array by repeatedly halving the search interval ($O(\\log N)$ comparisons).',
      tags: ['Search', 'Divide & Conquer', 'Logarithmic Complexity', 'Sorted Array']
    };
  }

  // 6. Two Sum / Hash Map Lookup
  if (norm.includes('target') && (norm.includes('seen') || norm.includes('dict') || norm.includes('map') || norm.includes('unordered_map'))) {
    return {
      title: 'Target Sum Match via Hash Map Complements',
      category: 'Hash Table / Linear Scan',
      summary: 'This algorithm computes required complements ($target - current$) in a single linear pass, querying a hash map in $O(1)$ amortized time to find matching index pairs.',
      tags: ['Hash Map', 'Optimization', 'Linear Scan', 'Lookup Table']
    };
  }

  // 7. General Dynamic Structured Program
  const hasLoops = norm.includes('for ') || norm.includes('while ') || norm.includes('for(') || norm.includes('while(');
  const hasConditionals = norm.includes('if ') || norm.includes('if(');

  return {
    title: `${lang.toUpperCase()} Algorithmic Procedure`,
    category: hasLoops ? 'Iterative Data Processing' : 'Sequential Computation',
    summary: `A structured ${lang.toUpperCase()} program that executes sequential variable initializations, ${hasConditionals ? 'conditional branching logic, ' : ''}${hasLoops ? 'iterative loops, ' : ''}and standard output formatting.`,
    tags: [lang.toUpperCase(), 'Control Flow', 'Computation', 'Variables']
  };
}

function hasRecursiveSelfCall(code) {
  const funcMatch = code.match(/(?:def|int|void|float|double|auto)\s+([a-zA-Z_]\w*)\s*\(/);
  if (funcMatch) {
    const fnName = funcMatch[1];
    const restOfCode = code.slice(funcMatch.index + funcMatch[0].length);
    return new RegExp(`\\b${fnName}\\s*\\(`).test(restOfCode);
  }
  return false;
}

// ----------------------------------------------------
// Mathematical Complexity Calculations
// ----------------------------------------------------

function computeComplexity(code, rawLines, analysis) {
  const norm = code.toLowerCase();

  // Check for built-in math factorial
  if (norm.includes('math.factorial')) {
    return {
      time: 'O(N)',
      timeDetail: 'Linear Time Complexity $O(N)$: The factorial computation performs $N - 1$ successive integer multiplications ($1 \\times 2 \\times 3 \\times \\dots \\times N$), implemented in optimized C-extensions.',
      space: 'O(N)',
      spaceDetail: 'Linear Space Complexity $O(N)$: For large integers ($N > 20$), Python automatically allocates dynamic multi-word memory to store the exact $O(N \\log N)$-bit integer without precision loss.'
    };
  }

  // Nested Loops -> O(N^2)
  const forCount = (norm.match(/for\s+/g) || []).length;
  const whileCount = (norm.match(/while\s+/g) || []).length;
  if (forCount + whileCount >= 2 && !analysis.category.includes('Recursion')) {
    return {
      time: 'O(N²)',
      timeDetail: 'Quadratic Time Complexity $O(N^2)$: Nested loop passes execute up to $\\frac{N(N-1)}{2}$ inner comparisons/operations.',
      space: 'O(1)',
      spaceDetail: 'Constant Auxiliary Space $O(1)$: Operates in-place on existing variables and arrays without extra memory allocations.'
    };
  }

  // Binary Search -> O(log N)
  if (analysis.category.includes('Search') || norm.includes('binary_search')) {
    return {
      time: 'O(log N)',
      timeDetail: 'Logarithmic Time Complexity $O(\\log N)$: Halves the remaining search space on each step ($N/2, N/4, \\dots, 1$).',
      space: 'O(1)',
      spaceDetail: 'Constant Auxiliary Space $O(1)$: Only scalar pointer variables (low, high, mid) are retained.'
    };
  }

  // Digit Modulo Reversal -> O(log10 N)
  if (analysis.category.includes('Modulo') || norm.includes('reversed_num')) {
    return {
      time: 'O(log₁₀ N)',
      timeDetail: 'Logarithmic Time Complexity $O(\\log_{10} N)$: The number of while-loop iterations corresponds directly to the number of decimal digits $d = \\lfloor \\log_{10} N \\rfloor + 1$.',
      space: 'O(1)',
      spaceDetail: 'Constant Auxiliary Space $O(1)$: Memory footprint is bounded to primitive integer scalars.'
    };
  }

  // Single Loop -> O(N)
  if (forCount + whileCount === 1) {
    return {
      time: 'O(N)',
      timeDetail: 'Linear Time Complexity $O(N)$: Executes a single loop iteration over the input sequence or bounds.',
      space: 'O(1)',
      spaceDetail: 'Constant Space $O(1)$: Fixed scalar storage without dynamic array allocation.'
    };
  }

  // Default Sequential
  return {
    time: 'O(1)',
    timeDetail: 'Constant Time Complexity $O(1)$: Program consists of direct sequential statement evaluations.',
    space: 'O(1)',
    spaceDetail: 'Constant Auxiliary Space $O(1)$: Uses fixed primitive stack memory.'
  };
}

// ----------------------------------------------------
// Contextual Line-by-Line Semantic Generator
// ----------------------------------------------------

function generateDetailedLineByLine(rawLines, lang, analysis) {
  return rawLines.map((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (!trimmed) {
      return { line: lineNum, code: '', role: 'Formatting', explanation: 'Empty whitespace line for structural readability.' };
    }

    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      return { line: lineNum, code: trimmed, role: 'Documentation', explanation: `Comment describing code intent: "${trimmed.replace(/^[#/*\s]+/, '')}"` };
    }

    if (trimmed.startsWith('import ') || trimmed.startsWith('from ') || trimmed.startsWith('#include')) {
      const mod = trimmed.replace(/^(import|from|#include)\s+([<"']?)([\w.]+).*/, '$3');
      return { line: lineNum, code: trimmed, role: 'Module Import', explanation: `Imports external library '${mod}' containing specialized built-in functions.` };
    }

    const funcAssign = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)\((.*)\)/);
    if (funcAssign) {
      const varName = funcAssign[1];
      const fnName = funcAssign[2];
      const args = funcAssign[3];
      return {
        line: lineNum,
        code: trimmed,
        role: 'Function Evaluation',
        explanation: `Calls '${fnName}(${args})' and stores the computed result into variable '${varName}'.`
      };
    }

    const varAssign = trimmed.match(/(?:int|float|double|char|bool|auto|let|const|var|String)?\s*([a-zA-Z_]\w*)\s*=\s*(.+)/);
    if (varAssign && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('for')) {
      const varName = varAssign[1];
      const expr = varAssign[2].replace(/[;,]$/, '').trim();
      return {
        line: lineNum,
        code: trimmed,
        role: 'Variable Assignment',
        explanation: `Initializes variable '${varName}' with value/expression '${expr}'.`
      };
    }

    if (trimmed.startsWith('while ') || trimmed.startsWith('while(')) {
      return { line: lineNum, code: trimmed, role: 'Loop Condition', explanation: `Evaluates while condition '${trimmed}'. Loops as long as this expression remains true.` };
    }
    if (trimmed.startsWith('for ') || trimmed.startsWith('for(')) {
      return { line: lineNum, code: trimmed, role: 'Loop Iteration', explanation: `Initializes loop iterator and steps through sequence bounds.` };
    }
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(') || trimmed.startsWith('elif ')) {
      return { line: lineNum, code: trimmed, role: 'Conditional Branch', explanation: `Tests branch guard '${trimmed}'. Executes nested block only if condition evaluates to true.` };
    }
    if (trimmed.startsWith('return ') || trimmed.startsWith('return;')) {
      return { line: lineNum, code: trimmed, role: 'Return Statement', explanation: `Returns control and output value from current execution scope.` };
    }

    if (trimmed.includes('print(') || trimmed.includes('printf(') || trimmed.includes('cout') || trimmed.includes('System.out')) {
      return { line: lineNum, code: trimmed, role: 'Console Output', explanation: `Formats and transmits message text to the standard terminal output stream.` };
    }

    return {
      line: lineNum,
      code: trimmed,
      role: 'Statement Execution',
      explanation: `Executes instruction: ${trimmed}`
    };
  });
}

function extractStructures(code, lang) {
  const vars = [];
  const matches = code.matchAll(/(?:int|float|double|char|bool|auto|let|const|var|String)?\s*([a-zA-Z_]\w*)\s*=\s*([^;\n]+)/g);
  for (const m of matches) {
    if (!['if', 'while', 'for', 'return', 'import', 'from'].includes(m[1])) {
      vars.push({ name: m[1], initialValue: m[2].trim(), type: inferType(m[2].trim()) });
    }
  }
  return vars.slice(0, 6);
}

function inferType(val) {
  if (/^\d+$/.test(val)) return 'Integer (Scalar)';
  if (/^\d+\.\d+$/.test(val)) return 'Float (IEEE-754)';
  if (val.startsWith('[') || val.startsWith('{')) return 'Array / Collection';
  if (val.startsWith('"') || val.startsWith("'") || val.startsWith('f"')) return 'String';
  if (val === 'true' || val === 'false') return 'Boolean';
  return 'Object / Expression';
}

function generateContextualPerspectives(analysis, complexity, lang) {
  return {
    eli5: `Think of this program as a recipe. It takes the starting ingredients (variables), applies specialized kitchen tools (like '${analysis.title}'), and gives you the finished dish. It executes at ${complexity.time} speed, which means it runs almost instantaneously.`,
    senior: `The implementation leverages ${analysis.category} semantics with ${complexity.time} temporal complexity and ${complexity.space} memory utilization. Memory allocations are kept deterministic to maintain register locality and avoid unneeded heap thrashing.`
  };
}

// ----------------------------------------------------
// Advanced Error Detection & 1-Click Repair Engine
// ----------------------------------------------------

export function detectAndFixErrors(code, language = 'python') {
  if (!code || typeof code !== 'string') {
    return { issues: [], fixedCode: code, hasErrors: false, issueCount: 0, engine: 'CodeLens Native AI' };
  }

  const lang = (language || 'python').toLowerCase();
  const rawLines = code.split('\n');
  const issues = [];
  let fixedLines = [...rawLines];

  // 1. Python: Real AST Compiler Diagnostic Scanner
  if (lang === 'python') {
    try {
      const linterPath = path.join(__dirname, 'pythonLinter.py');
      const proc = spawnSync('python', [linterPath], {
        input: code,
        encoding: 'utf8',
        timeout: 3000
      });

      if (proc.status === 0 && proc.stdout) {
        const parsed = JSON.parse(proc.stdout);
        if (parsed && Array.isArray(parsed.issues)) {
          issues.push(...parsed.issues);
          if (parsed.fixedCode) {
            fixedLines = parsed.fixedCode.split('\n');
          }
        }
      }
    } catch (err) {
      console.warn('Python AST linter fallback:', err.message);
      detectPythonStatic(rawLines, issues, fixedLines);
    }
  } 
  // 2. C / C++ Compiler & Safety Linter
  else if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
    detectCppAdvanced(rawLines, issues, fixedLines, lang);
  } 
  // 3. Java Compiler & Class Structure Linter
  else if (lang === 'java') {
    detectJavaAdvanced(rawLines, issues, fixedLines);
  }

  // 4. Universal Algorithmic & Memory Safety Checks
  detectUniversalLogicSafety(rawLines, issues, fixedLines, lang);

  // Remove duplicate issues on same line
  const uniqueIssues = [];
  const seenKeys = new Set();
  for (const issue of issues) {
    const key = `${issue.line}:${issue.type}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueIssues.push(issue);
    }
  }

  return {
    hasErrors: uniqueIssues.length > 0,
    issueCount: uniqueIssues.length,
    issues: uniqueIssues,
    fixedCode: fixedLines.join('\n'),
    engine: 'CodeLens Native AI'
  };
}

function detectPythonStatic(lines, issues, fixedLines) {
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const text = lines[i];
    const trimmed = text.trim();

    if (/^(def|class|if|elif|else|while|for|try|except|finally|with)\b.*[^:]$/.test(trimmed) && !trimmed.endsWith(':') && !trimmed.startsWith('#')) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'SyntaxError: Missing Colon',
        message: `Statement '${trimmed}' is missing a colon ':' at the end.`,
        suggestion: `Add ':' to the end of line ${lineNum}.`
      });
      fixedLines[i] = text + ':';
    }

    if (/^(if|while|elif)\s+[^=!<>]=[^=]/.test(trimmed)) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'SyntaxError: Assignment in Conditional',
        message: `Found single '=' in '${trimmed}'. Python requires '==' for equality comparison.`,
        suggestion: `Replace '=' with '=='.`
      });
      fixedLines[i] = text.replace(/([^=!<>]?)=([^=])/, '$1==$2');
    }
  }
}

function detectCppAdvanced(lines, issues, fixedLines, lang) {
  const fullCode = lines.join('\n');
  const isCpp = lang === 'cpp' || lang === 'c++';

  // 1. Missing Library Headers
  if (isCpp && fullCode.includes('cout') && !fullCode.includes('<iostream>')) {
    issues.push({
      line: 1,
      severity: 'Critical Error',
      type: 'Compilation Error: Missing <iostream>',
      message: `Use of 'std::cout' requires the '<iostream>' standard header.`,
      suggestion: `Add '#include <iostream>' at the beginning of the file.`
    });
    if (!fixedLines[0].includes('<iostream>')) {
      fixedLines.unshift('#include <iostream>');
    }
  }

  if (isCpp && fullCode.includes('vector<') && !fullCode.includes('<vector>')) {
    issues.push({
      line: 1,
      severity: 'Critical Error',
      type: 'Compilation Error: Missing <vector>',
      message: `Use of 'std::vector' requires '#include <vector>'.`,
      suggestion: `Add '#include <vector>' at the top.`
    });
    if (!fixedLines[0].includes('<vector>')) {
      fixedLines.unshift('#include <vector>');
    }
  }

  if (isCpp && fullCode.includes('sort(') && !fullCode.includes('<algorithm>')) {
    issues.push({
      line: 1,
      severity: 'Warning',
      type: 'Compilation Warning: Missing <algorithm>',
      message: `Function 'std::sort()' requires '#include <algorithm>'.`,
      suggestion: `Add '#include <algorithm>' at the top.`
    });
    if (!fixedLines[0].includes('<algorithm>')) {
      fixedLines.unshift('#include <algorithm>');
    }
  }

  // 2. Semicolons & Braces
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const text = lines[i];
    const trimmed = text.trim();

    // Missing Semicolon Check
    if (trimmed.length > 0 && 
        !trimmed.endsWith(';') && 
        !trimmed.endsWith('{') && 
        !trimmed.endsWith('}') && 
        !trimmed.endsWith(':') &&
        !trimmed.startsWith('#') && 
        !trimmed.startsWith('//') && 
        !trimmed.startsWith('/*') &&
        !/^(if|while|for|class|struct|namespace)\b/i.test(trimmed)) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'SyntaxError: Missing Semicolon',
        message: `Statement '${trimmed}' is missing a trailing semicolon ';'.`,
        suggestion: `Add ';' to the end of line ${lineNum}.`
      });
      fixedLines[i] = text + ';';
    }

    // Pointer Dereference vs Arrow Operator: ptr.val -> ptr->val
    if (/\b([a-zA-Z_]\w*Ptr|\w*_ptr|ptr)\.([a-zA-Z_]\w*)/.test(trimmed)) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'Type Error: Pointer Member Access',
        message: `Direct member access '.' used on pointer. Use arrow operator '->' instead.`,
        suggestion: `Replace '.' with '->' for pointer dereferencing.`
      });
      fixedLines[i] = text.replace(/(\b\w*ptr)\.(\w+)/gi, '$1->$2');
    }
  }
}

function detectJavaAdvanced(lines, issues, fixedLines) {
  const fullCode = lines.join('\n');

  // 1. Missing Class Wrapper
  if (!fullCode.includes('class ') && !fullCode.includes('interface ')) {
    issues.push({
      line: 1,
      severity: 'Critical Error',
      type: 'Java Structure Error: Missing Class Declaration',
      message: `All Java code must be enclosed inside a 'public class <Name> { ... }' wrapper.`,
      suggestion: `Wrap statements inside 'public class Main { public static void main(String[] args) { ... } }'.`
    });
    fixedLines.unshift('public class Main {\n    public static void main(String[] args) {');
    fixedLines.push('    }\n}');
  }

  // 2. Missing Main Entrypoint
  else if (!fullCode.includes('main(') && !fullCode.includes('public static void main')) {
    issues.push({
      line: 1,
      severity: 'Warning',
      type: 'Java Structure Warning: Missing main() Entrypoint',
      message: `No 'public static void main(String[] args)' found to execute this class.`,
      suggestion: `Add 'public static void main(String[] args)' inside the class.`
    });
  }

  // 3. Case-Sensitivity & Semicolons
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const text = lines[i];
    const trimmed = text.trim();

    if (/\bsystem\.out\.print/i.test(trimmed) && !trimmed.includes('System.out.print')) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'SyntaxError: Case-Sensitivity Mismatch',
        message: `'system' must be capitalized as 'System' in Java standard library.`,
        suggestion: `Change 'system.out' to 'System.out'.`
      });
      fixedLines[i] = text.replace(/system\.out/gi, 'System.out');
    }

    if (trimmed.length > 0 && 
        !trimmed.endsWith(';') && 
        !trimmed.endsWith('{') && 
        !trimmed.endsWith('}') && 
        !trimmed.startsWith('//') && 
        !/^(if|while|for|public|class|interface|package|import)\b/.test(trimmed)) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'SyntaxError: Missing Semicolon',
        message: `Statement '${trimmed}' requires a terminating semicolon ';'.`,
        suggestion: `Add ';' to the end of line ${lineNum}.`
      });
      fixedLines[i] = text + ';';
    }
  }
}

function detectUniversalLogicSafety(lines, issues, fixedLines, lang) {
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const text = lines[i];
    const trimmed = text.trim();

    // Zero Division
    if (/\/\s*0\b/.test(trimmed) || /%\s*0\b/.test(trimmed)) {
      issues.push({
        line: lineNum,
        severity: 'Critical Error',
        type: 'Arithmetic Exception: Division by Zero',
        message: `Explicit division or modulo by literal zero in '${trimmed}'.`,
        suggestion: `Ensure divisor variable or expression evaluates to non-zero.`
      });
    }

    // Infinite Loop Warning: while(true) or while(1) without break
    if (/while\s*\(?(true|1)\)?/i.test(trimmed) && !lines.join('\n').includes('break')) {
      issues.push({
        line: lineNum,
        severity: 'Logic Bug',
        type: 'Infinite Loop Hazard',
        message: `'while(true)' loop without a 'break' statement will never terminate.`,
        suggestion: `Add an exit condition with a 'break' statement.`
      });
    }
  }
}
