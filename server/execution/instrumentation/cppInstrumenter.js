/**
 * Auto-instrumenter for C++ Source Code (G++ / Clang++)
 * Injects step checkpoints that stream line executions, function scopes,
 * and synchronized console output.
 */

const CPP_PREAMBLE = `
#include <iostream>

namespace _codelens {
    static int _cl_steps = 0;
    inline void step(int line, const char* func) {
        if (_cl_steps++ > 500) return;
        std::cout.flush();
        std::cout << ">>>CL_STEP:{\\"line\\":" << line << ",\\"func\\":\\"" << func << "\\",\\"vars\\":{}}:CL_STEP<<<\\n";
        std::cout.flush();
    }
}
`;

export function instrumentCpp(sourceCode) {
  const rawLines = sourceCode.split('\n');
  const instrumented = [CPP_PREAMBLE];
  let currentFunc = 'main';
  let braceDepth = 0;

  for (let idx = 0; idx < rawLines.length; idx++) {
    const lineNum = idx + 1;
    const rawLine = rawLines[idx];
    const trimmed = rawLine.trim();

    // Skip preprocessor, comments, empty lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      instrumented.push(rawLine);
      continue;
    }

    // Function signature detection (only outside any function)
    if (braceDepth === 0) {
      const funcMatch = trimmed.match(/^(?:[\w:<>]+\s+)+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{?/);
      if (funcMatch && !trimmed.startsWith('for') && !trimmed.startsWith('while') && !trimmed.startsWith('if') && !trimmed.startsWith('catch')) {
        currentFunc = funcMatch[1];
      }
    }

    const openBraces = (rawLine.match(/\{/g) || []).length;
    const closeBraces = (rawLine.match(/\}/g) || []).length;

    // Check if line is purely a brace
    if (trimmed === '{' || trimmed === '}' || trimmed === '};') {
      instrumented.push(rawLine);
      braceDepth += (openBraces - closeBraces);
      continue;
    }

    if (braceDepth > 0) {
      const probe = `_codelens::step(${lineNum}, "${currentFunc}");`;
      instrumented.push(`  ${probe}`);
      instrumented.push(rawLine);
    } else {
      instrumented.push(rawLine);
    }

    braceDepth += (openBraces - closeBraces);
  }

  return instrumented.join('\n');
}
