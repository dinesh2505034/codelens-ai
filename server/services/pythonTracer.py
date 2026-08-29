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

def explain_python_exception(exc_type, exc_val, line_code=""):
    msg = str(exc_val)
    if exc_type == 'ValueError':
        int_match = re.search(r"invalid literal for int\(\) with base 10: '([^']*)'", msg)
        if int_match:
            val = int_match.group(1)
            return f"❌ ValueError: Invalid literal for int() - The user entered \"{val}\", but int() cannot convert non-integer text to a number. Please enter digits (e.g. 15, -42) or use str(input()) if you want to accept text."
        float_match = re.search(r"could not convert string to float: '([^']*)'", msg)
        if float_match:
            val = float_match.group(1)
            return f"❌ ValueError: Cannot convert to float - The user entered \"{val}\", which is not a valid floating-point number (e.g. 3.14, 0.5)."
        return f"❌ ValueError: {msg}"
    elif exc_type == 'ZeroDivisionError':
        return f"❌ ZeroDivisionError: Division by zero - Attempted to divide or modulo by 0 on statement: {line_code.strip()}."
    elif exc_type == 'TypeError':
        return f"❌ TypeError: {msg} - Data types are incompatible for this operation."
    elif exc_type == 'IndexError':
        return f"❌ IndexError: {msg} - Attempted to access an index beyond the boundaries of the list."
    elif exc_type == 'KeyError':
        return f"❌ KeyError: Key {msg} does not exist in the dictionary."
    elif exc_type == 'NameError':
        return f"❌ NameError: {msg} - Variable or function is not defined."
    return f"❌ {exc_type}: {msg}"

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
        error_explanation = explain_python_exception(exc_type_name, exc_obj or exec_error, err_line_code)

        error_step = {
            "line": err_lineno,
            "lineCode": err_line_code,
            "variables": pending_step["variables"] if pending_step else (steps[-1]["variables"] if steps else {}),
            "callStack": [{"frameName": "Main Block", "line": err_lineno}],
            "output": full_output.rstrip(),
            "hasError": True,
            "errorType": exc_type_name,
            "errorMessage": str(exc_obj) if exc_obj else exec_error,
            "explanation": error_explanation,
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
