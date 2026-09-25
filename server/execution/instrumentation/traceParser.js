/**
 * Parses interleaved output stream containing >>>CL_STEP:{...}:CL_STEP<<<
 * into a step-by-step trace with synchronized cumulative output and variable tracking.
 */
export function parseInstrumentedTrace(rawStdout, rawLines) {
  // Match the marker cleanly without capturing separating newlines
  const parts = rawStdout.split(/(?:\r?\n)?>>>CL_STEP:({.*?\}):CL_STEP<<<\r?\n?/);
  let cumulativeOutput = '';
  const rawSteps = [];
  const currentVars = {};

  for (let i = 1; i < parts.length; i += 2) {
    const jsonStr = parts[i];
    const userOutput = parts[i - 1] || '';
    if (userOutput.length > 0) {
      cumulativeOutput += userOutput;
    }

    try {
      const meta = JSON.parse(jsonStr);
      const lineNum = meta.line;
      const funcName = meta.func || 'main';
      const lineCode = (rawLines[lineNum - 1] || '').trim();

      // If probe provided explicit vars, merge them
      if (meta.vars && typeof meta.vars === 'object') {
        Object.assign(currentVars, meta.vars);
      }

      // Dynamically track variable assignments from executed line
      // 1. Array declaration: int arr[] = {1, 2, 3};
      const arrMatch = lineCode.match(/([a-zA-Z_]\w*)\s*(?:\[\s*\])?\s*=\s*\{([^}]+)\}/);
      if (arrMatch) {
        const arrName = arrMatch[1];
        const elements = arrMatch[2].split(',').map(s => {
          const num = Number(s.trim());
          return isNaN(num) ? s.trim() : num;
        });
        currentVars[arrName] = elements;
      }
      // 2. Scalar variable declaration or assignment: int x = 42; or x = 99;
      else {
        const varMatch = lineCode.match(/(?:int|long|double|float|char|bool|auto|String)?\s*(?:&|\*)?\s*([a-zA-Z_]\w*)\s*=\s*([^;]+);/);
        if (varMatch && !lineCode.startsWith('if') && !lineCode.startsWith('for') && !lineCode.startsWith('while')) {
          const vName = varMatch[1];
          let expr = varMatch[2].trim();
          if (expr.startsWith('"') && expr.endsWith('"')) {
            currentVars[vName] = expr.slice(1, -1);
          } else {
            const num = Number(expr);
            currentVars[vName] = !isNaN(num) ? num : expr;
          }
        }
      }

      // 3. Array element assignment / swap: arr[j] = temp;
      const arrAssignMatch = lineCode.match(/([a-zA-Z_]\w*)\[([^\]]+)\]\s*=\s*([^;]+);/);
      if (arrAssignMatch) {
        const arrName = arrAssignMatch[1];
        const idxExpr = arrAssignMatch[2].trim();
        const valExpr = arrAssignMatch[3].trim();
        if (Array.isArray(currentVars[arrName])) {
          const idx = Number(currentVars[idxExpr] !== undefined ? currentVars[idxExpr] : idxExpr);
          const val = currentVars[valExpr] !== undefined ? currentVars[valExpr] : (Number(valExpr) || valExpr);
          if (!isNaN(idx) && idx >= 0 && idx < currentVars[arrName].length) {
            currentVars[arrName] = [...currentVars[arrName]];
            currentVars[arrName][idx] = val;
          }
        }
      }

      // Build call stack
      const stack = [{ frameName: `${funcName}()`, line: lineNum }];
      if (funcName !== 'main') {
        stack.push({ frameName: 'main()', line: 1 });
      }

      rawSteps.push({
        line: lineNum,
        lineCode: rawLines[lineNum - 1] || '',
        variables: { ...currentVars },
        callStack: stack,
        output: cumulativeOutput,
        explanation: `Execute line ${lineNum}: ${lineCode}`
      });
    } catch (e) {
      // Ignore malformed chunk
    }
  }

  // Any output emitted after the final step
  const trailingOutput = parts[parts.length - 1] || '';
  if (trailingOutput.length > 0) {
    cumulativeOutput += trailingOutput;
    if (rawSteps.length > 0) {
      rawSteps[rawSteps.length - 1].output = cumulativeOutput;
    }
  }

  return {
    steps: rawSteps,
    finalOutput: cumulativeOutput
  };
}
