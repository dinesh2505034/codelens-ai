import sys
import json
import ast
import traceback

def lint_python_code(source_code):
    issues = []
    lines = source_code.splitlines()
    fixed_lines = list(lines)

    # 1. Check Syntax via Python AST Compiler
    try:
        ast.parse(source_code, filename="<user_code>")
    except SyntaxError as e:
        lineno = e.lineno or 1
        offset = e.offset or 1
        msg = e.msg or "Syntax error"
        line_text = lines[lineno - 1] if 0 < lineno <= len(lines) else ""
        
        # Analyze specific syntax mistake & suggest automatic fix
        suggestion = "Check syntax on this line."
        severity = "Critical Error"
        err_type = "SyntaxError"

        if "expected ':'" in msg or "invalid syntax" in msg and any(line_text.strip().startswith(kw) for kw in ['if', 'while', 'for', 'def', 'class', 'elif', 'else', 'try', 'except', 'finally', 'with']):
            if not line_text.strip().endswith(':'):
                msg = f"Missing terminating colon ':' after '{line_text.strip()}'"
                suggestion = f"Add ':' to the end of line {lineno}."
                err_type = "SyntaxError: Missing Colon"
                fixed_lines[lineno - 1] = line_text + ":"

        elif "was never closed" in msg or "unmatched" in msg:
            err_type = "SyntaxError: Unclosed Bracket/Quote"
            suggestion = "Ensure all brackets (), [], {} and quotes ' \" are properly balanced."

        issues.append({
            "line": lineno,
            "column": offset,
            "severity": severity,
            "type": err_type,
            "message": msg,
            "suggestion": suggestion
        })

    except IndentationError as e:
        lineno = e.lineno or 1
        issues.append({
            "line": lineno,
            "column": e.offset or 1,
            "severity": "Critical Error",
            "type": "IndentationError",
            "message": e.msg or "Unexpected indentation or unindented block",
            "suggestion": "Align indentation with 4 spaces."
        })

    # 2. Heuristic Semantic & Logic Bug Checks
    for idx, line in enumerate(lines):
        line_num = idx + 1
        trimmed = line.strip()

        # Division by zero
        if "/ 0" in trimmed or "% 0" in trimmed or "/0" in trimmed or "%0" in trimmed:
            issues.append({
                "line": line_num,
                "column": line.find('/ 0') + 1 if '/ 0' in line else 1,
                "severity": "Critical Error",
                "type": "ZeroDivisionError",
                "message": f"Direct division or modulo by zero detected in '{trimmed}'.",
                "suggestion": "Ensure the divisor expression is non-zero."
            })

        # Assignment inside conditional (e.g. if x = 5)
        if any(trimmed.startswith(kw) for kw in ['if ', 'elif ', 'while ']) and " = " in trimmed and " == " not in trimmed and " <= " not in trimmed and " >= " not in trimmed and " != " not in trimmed:
            issues.append({
                "line": line_num,
                "column": line.find('=') + 1,
                "severity": "Critical Error",
                "type": "Logic Trap: Assignment in Condition",
                "message": f"Found single '=' in '{trimmed}'. Comparison requires '=='.",
                "suggestion": "Replace '=' with '==' for boolean equality testing."
            })
            fixed_lines[idx] = line.replace(' = ', ' == ')

        # Float division trap in integer digit math
        if "/=" in trimmed and "//=" not in trimmed and any(term in source_code for term in ['reversed_num', 'digit', '% 10', 'math.factorial']):
            issues.append({
                "line": line_num,
                "column": line.find('/=') + 1,
                "severity": "Warning",
                "type": "Type Trap: Float Division (/=)",
                "message": f"'/=' produces a floating-point number in Python 3. For integer algorithms, use '//=' for floor division.",
                "suggestion": "Replace '/=' with '//=' to prevent float conversion."
            })
            fixed_lines[idx] = line.replace('/=', '//=')

        # Infinite loop warning: while True without break
        if trimmed.startswith('while ') and ('True' in trimmed or '1' in trimmed) and 'break' not in source_code:
            issues.append({
                "line": line_num,
                "column": 1,
                "severity": "Logic Bug",
                "type": "Infinite Loop Warning",
                "message": f"Loop '{trimmed}' has no apparent termination condition or 'break' statement.",
                "suggestion": "Add a loop termination condition or a conditional break statement."
            })

    return {
        "hasErrors": len(issues) > 0,
        "issueCount": len(issues),
        "issues": issues,
        "fixedCode": "\n".join(fixed_lines)
    }

if __name__ == '__main__':
    code_input = sys.stdin.read()
    res = lint_python_code(code_input)
    print(json.dumps(res))
