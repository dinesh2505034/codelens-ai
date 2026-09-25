/**
 * Auto-instrumenter for Java Source Code (Javac / Java)
 * Injects step checkpoints as an inner static helper class, streaming line executions,
 * method scopes, and synchronized console output.
 */

const INNER_TRACER = `
    static class _CodeLensTracer {
        static int _cl_steps = 0;
        public static void emitStep(int line, String func) {
            if (_cl_steps++ > 500) return;
            System.out.flush();
            System.out.print(">>>CL_STEP:{\\"line\\":" + line + ",\\"func\\":\\"" + func + "\\",\\"vars\\":{}}:CL_STEP<<<\\n");
            System.out.flush();
        }
    }
`;

export function instrumentJava(sourceCode) {
  const rawLines = sourceCode.split('\n');
  const instrumented = [];
  let currentMethod = 'main';
  let braceDepth = 0;
  let inClass = false;
  let injectedTracer = false;

  for (let idx = 0; idx < rawLines.length; idx++) {
    const lineNum = idx + 1;
    const rawLine = rawLines[idx];
    const trimmed = rawLine.trim();

    // Skip import, package, comments, empty lines
    if (!trimmed || trimmed.startsWith('package ') || trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      instrumented.push(rawLine);
      continue;
    }

    // Class definition
    if ((trimmed.includes('class ') || trimmed.includes('interface ')) && !inClass) {
      inClass = true;
      instrumented.push(rawLine);
      if (rawLine.includes('{') && !injectedTracer) {
        instrumented.push(INNER_TRACER);
        injectedTracer = true;
      }
      const openBraces = (rawLine.match(/\{/g) || []).length;
      const closeBraces = (rawLine.match(/\}/g) || []).length;
      braceDepth += (openBraces - closeBraces);
      continue;
    }

    // If class opened on a subsequent line
    if (inClass && !injectedTracer && rawLine.includes('{')) {
      instrumented.push(rawLine);
      instrumented.push(INNER_TRACER);
      injectedTracer = true;
      const openBraces = (rawLine.match(/\{/g) || []).length;
      const closeBraces = (rawLine.match(/\}/g) || []).length;
      braceDepth += (openBraces - closeBraces);
      continue;
    }

    // Method signature detection (when inside class, braceDepth === 1)
    if (inClass && braceDepth === 1) {
      const methodMatch = trimmed.match(/(?:public|private|protected|static|final|\s)+[\w<>\[\]]+\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{?/);
      if (methodMatch && !trimmed.startsWith('for') && !trimmed.startsWith('while') && !trimmed.startsWith('if')) {
        currentMethod = methodMatch[1];
      }
    }

    const openBraces = (rawLine.match(/\{/g) || []).length;
    const closeBraces = (rawLine.match(/\}/g) || []).length;

    // Check if line is purely a brace
    if (trimmed === '{' || trimmed === '}' || trimmed === '};') {
      instrumented.push(rawLine);
      braceDepth += (openBraces - closeBraces);
      if (braceDepth <= 0) inClass = false;
      continue;
    }

    // Inside method body (braceDepth >= 2: class { method { ... } })
    if (inClass && braceDepth >= 2) {
      const probe = `_CodeLensTracer.emitStep(${lineNum}, "${currentMethod}");`;

      if (trimmed.startsWith('return ') || trimmed === 'return;') {
        instrumented.push(`  ${probe}`);
        instrumented.push(rawLine);
      } else if (trimmed.startsWith('for') || trimmed.startsWith('while') || trimmed.startsWith('if')) {
        instrumented.push(`  ${probe}`);
        instrumented.push(rawLine);
      } else {
        instrumented.push(`  ${probe}`);
        instrumented.push(rawLine);
      }
    } else {
      instrumented.push(rawLine);
    }

    braceDepth += (openBraces - closeBraces);
    if (braceDepth <= 0) inClass = false;
  }

  return instrumented.join('\n');
}
