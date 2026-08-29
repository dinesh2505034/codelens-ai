import sys
import json
import io
import time
import builtins
import traceback
import re

def clean_locals(f_locals):
    locs = {}
    for k, v in f_locals.items():
        if not k.startswith('_') and k != 'math':
            try:
                if isinstance(v, int):
                    if abs(v) > 9007199254740991:
                        locs[k] = str(v)
                    else:
                        locs[k] = v
                elif isinstance(v, (float, bool, str, list, dict, set, tuple)):
                    locs[k] = v
                else:
                    locs[k] = repr(v)
            except:
                locs[k] = str(v)
    return locs

def build_dynamic_error_diagnostic(exc_type, exc_val, line_code=""):
    msg = str(exc_val)
    line_code = (line_code or "").strip()
    
    # Detect assigned variable name if present (e.g. "l = int(...)")
    var_match = re.match(r"^([a-zA-Z_]\w*)\s*=", line_code)
    var_name = var_match.group(1) if var_match else "the variable"
    
    if exc_type == 'ValueError':
        int_match = re.search(r"invalid literal for int\(\) with base 10: '([^']*)'", msg)
        if int_match:
            entered_val = int_match.group(1)
            summary = f"The program expects {var_name} to contain an integer because int() is used to convert the user's input into an integer. The user entered '{entered_val}', which cannot be converted to an integer. Python therefore raised a ValueError."
            return {
                "summary": summary,
                "expected": f"An integer value for variable '{var_name}' (whole numbers 0-9, e.g. 4, 15, -10)",
                "received": f"'{entered_val}'",
                "failedOperation": f"int() conversion on statement: {line_code}",
                "whyFailed": f"The character '{entered_val}' is an alphabetic text string and does not represent numeric digits in base 10.",
                "exception": f"ValueError: invalid literal for int() with base 10: '{entered_val}'",
                "howToFix": f"Enter whole digits without letters or quotes when prompted for {var_name}, or use str(input()) if you intend to accept text strings.",
                "example": "Enter a valid integer such as 4"
            }
        
        float_match = re.search(r"could not convert string to float: '([^']*)'", msg)
        if float_match:
            entered_val = float_match.group(1)
            summary = f"The program expects {var_name} to contain a numerical value because float() is used to convert the user's input. The user entered '{entered_val}', which cannot be converted to a float. Python therefore raised a ValueError."
            return {
                "summary": summary,
                "expected": f"A floating-point or integer number for '{var_name}' (e.g. 4, 3.14, -2.5)",
                "received": f"'{entered_val}'",
                "failedOperation": f"float() conversion on statement: {line_code}",
                "whyFailed": f"The string '{entered_val}' cannot be parsed as a floating-point number.",
                "exception": f"ValueError: could not convert string to float: '{entered_val}'",
                "howToFix": "Enter valid numeric digits (with optional decimal point).",
                "example": "Enter a valid number such as 4 or 3.14"
            }

    elif exc_type == 'ZeroDivisionError':
        summary = f"The program attempted to divide or compute modulo by zero on statement '{line_code}'. Division by zero is mathematically undefined. Python therefore raised a ZeroDivisionError."
        return {
            "summary": summary,
            "expected": "A non-zero divisor (denominator != 0)",
            "received": "0",
            "failedOperation": f"Division or modulo operation on statement: {line_code}",
            "whyFailed": "Dividing any number by 0 is undefined in mathematics and disallowed in Python runtime.",
            "exception": f"ZeroDivisionError: {msg}",
            "howToFix": "Add a conditional check (if divisor != 0:) before dividing, or ensure the divisor is non-zero.",
            "example": "Use a non-zero denominator such as 2 or 5"
        }

    elif exc_type == 'IndexError':
        summary = f"The program attempted to access an element at an index outside the boundaries of the list on statement '{line_code}'. Python therefore raised an IndexError."
        return {
            "summary": summary,
            "expected": "An index within the valid range 0 to len(list) - 1",
            "received": "An out-of-range index",
            "failedOperation": f"List index access on statement: {line_code}",
            "whyFailed": msg,
            "exception": f"IndexError: {msg}",
            "howToFix": "Check the list length with len(list) before indexing to ensure index < len(list).",
            "example": "Access index 0 for the first element"
        }

    elif exc_type == 'TypeError':
        summary = f"The program performed an operation with incompatible data types on statement '{line_code}'. Python therefore raised a TypeError."
        return {
            "summary": summary,
            "expected": "Matching, compatible operand data types",
            "received": "Mismatched data types",
            "failedOperation": line_code,
            "whyFailed": msg,
            "exception": f"TypeError: {msg}",
            "howToFix": "Convert types explicitly (e.g. str(x) or int(x)) before combining them.",
            "example": "Convert integer to string using str(val) before concatenating with text"
        }

    return {
        "summary": f"Python encountered a {exc_type} on statement '{line_code}': {msg}",
        "expected": "Valid executable runtime syntax and argument values",
        "received": "Invalid runtime argument or state",
        "failedOperation": line_code,
        "whyFailed": msg,
        "exception": f"{exc_type}: {msg}",
        "howToFix": "Review the statement parameters and ensure valid arguments are supplied.",
        "example": "Verify the syntax and input types for this statement"
    }

def run_traced_code(source_code, stdin_data=""):
    start_time = time.time()
    steps = []
    pending_step = None
    output_buffer = io.StringIO()
    lines = source_code.splitlines()

    stdin_lines = [l for l in (stdin_data or "").splitlines()]
    stdin_idx = [0]
    waiting_input = {"is_waiting": False, "prompt": "", "line": 1}

    class InterceptStdout:
        def write(self, text):
            output_buffer.write(text)
        def flush(self):
            pass

    old_stdout = sys.stdout
    old_input = builtins.input

    def custom_input(prompt=""):
        if prompt:
            output_buffer.write(str(prompt))
        if stdin_idx[0] < len(stdin_lines):
            val = stdin_lines[stdin_idx[0]]
            stdin_idx[0] += 1
            output_buffer.write(f"{val}\n")
            return val
        else:
            # Need interactive input from user
            waiting_input["is_waiting"] = True
            waiting_input["prompt"] = str(prompt) if prompt else ""
            raise StopIteration("__WAITING_FOR_USER_INPUT__")

    sys.stdout = InterceptStdout()
    builtins.input = custom_input

    def trace_lines(frame, event, arg):
        nonlocal pending_step
        if frame.f_code.co_filename == '<user_code>':
            if event == 'line':
                # Finalize the previous step with the post-execution variables & output
                if pending_step is not None:
                    pending_step['variables'] = clean_locals(frame.f_locals)
                    pending_step['output'] = output_buffer.getvalue()
                    steps.append(pending_step)

                lineno = frame.f_lineno
                line_content = lines[lineno - 1] if 0 < lineno <= len(lines) else ""
                pending_step = {
                    "line": lineno,
                    "lineCode": line_content,
                    "variables": clean_locals(frame.f_locals),
                    "callStack": [{"frameName": frame.f_code.co_name if frame.f_code.co_name != '<module>' else 'Main Block', "line": lineno}],
                    "output": output_buffer.getvalue()
                }
            elif event == 'return':
                if pending_step is not None:
                    pending_step['variables'] = clean_locals(frame.f_locals)
                    pending_step['output'] = output_buffer.getvalue()
                    steps.append(pending_step)
                    pending_step = None
        return trace_lines

    compiled_code = None
    parse_error = None
    try:
        compiled_code = compile(source_code, '<user_code>', 'exec')
    except Exception as e:
        parse_error = traceback.format_exc()

    if parse_error:
        sys.stdout = old_stdout
        builtins.input = old_input
        elapsed = time.time() - start_time
        return {
            "error": "SyntaxError",
            "exitCode": 1,
            "executionTime": f"{elapsed:.3f}s",
            "compilerOutput": f"[Running] python -u \"main.py\"\n\n{parse_error}\n[Done] exited with code=1 in {elapsed:.3f} seconds",
            "finalOutput": parse_error,
            "steps": [{
                "line": 1,
                "lineCode": lines[0] if lines else "",
                "variables": {},
                "callStack": [{"frameName": "Main Block", "line": 1}],
                "output": parse_error,
                "hasError": True,
                "errorType": "SyntaxError",
                "explanation": "❌ SyntaxError: Code contains a syntax or compilation error."
            }],
            "totalSteps": 1
        }

    global_scope = {"__name__": "__main__"}
    sys.settrace(trace_lines)
    exec_error = None
    exc_obj = None
    err_lineno = 1
    
    try:
        exec(compiled_code, global_scope)
    except StopIteration as e:
        if str(e) == "__WAITING_FOR_USER_INPUT__":
            pass # Normal pause for interactive user input
        else:
            exec_error = traceback.format_exc()
            exc_obj = e
    except Exception as e:
        exec_error = traceback.format_exc()
        exc_obj = e
        tb = sys.exc_info()[2]
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == '<user_code>':
                err_lineno = tb.tb_lineno
            tb = tb.tb_next
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        builtins.input = old_input

    # Ensure last pending step is captured if not already appended
    if not waiting_input["is_waiting"] and not exec_error and pending_step is not None:
        pending_step['output'] = output_buffer.getvalue()
        steps.append(pending_step)
        pending_step = None

    elapsed = time.time() - start_time
    raw_stdout = output_buffer.getvalue()
    
    if exec_error:
        full_output = f"{raw_stdout}\n{exec_error}" if raw_stdout else exec_error
        exit_code = 1
        
        exc_type_name = type(exc_obj).__name__ if exc_obj else "RuntimeError"
        err_line_code = lines[err_lineno - 1] if 0 < err_lineno <= len(lines) else ""
        diagnostic = build_dynamic_error_diagnostic(exc_type_name, exc_obj or exec_error, err_line_code)

        error_step = {
            "line": err_lineno,
            "lineCode": err_line_code,
            "variables": pending_step["variables"] if pending_step else (steps[-1]["variables"] if steps else {}),
            "callStack": [{"frameName": "Main Block", "line": err_lineno}],
            "output": full_output.rstrip(),
            "hasError": True,
            "errorType": exc_type_name,
            "errorMessage": str(exc_obj) if exc_obj else exec_error,
            "explanation": diagnostic["summary"],
            "errorDiagnostic": diagnostic,
            "statusText": f"Terminated with {exc_type_name}"
        }
        steps.append(error_step)
    else:
        full_output = raw_stdout
        exit_code = 0

    compiler_banner = f"[Running] python -u \"main.py\"\n{full_output.rstrip()}\n\n[Done] exited with code={exit_code} in {elapsed:.3f} seconds"

    if waiting_input["is_waiting"]:
        current_line = pending_step["line"] if pending_step else (steps[-1]["line"] if steps else 1)
        current_code = lines[current_line - 1] if 0 < current_line <= len(lines) else ""
        
        waiting_step = {
            "line": current_line,
            "lineCode": current_code,
            "variables": steps[-1]["variables"] if steps else {},
            "callStack": [{"frameName": "Main Block", "line": current_line}],
            "output": raw_stdout,
            "isWaitingForInput": True,
            "inputPrompt": waiting_input["prompt"] or "Enter input:"
        }
        steps = [waiting_step]

    return {
        "steps": steps,
        "totalSteps": len(steps),
        "finalOutput": full_output.rstrip(),
        "compilerOutput": compiler_banner,
        "isWaitingForInput": waiting_input["is_waiting"],
        "inputPrompt": waiting_input["prompt"],
        "exitCode": exit_code,
        "executionTime": f"{elapsed:.3f}s",
        "error": exec_error
    }

if __name__ == '__main__':
    stdin_input = sys.stdin.read()
    try:
        data = json.loads(stdin_input)
        code = data.get("code", "")
        custom_input = data.get("customInputs", "")
    except:
        code = stdin_input
        custom_input = ""
    
    result = run_traced_code(code, custom_input)
    print(json.dumps(result))
