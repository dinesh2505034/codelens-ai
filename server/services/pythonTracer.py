import sys
import json
import io
import time
import traceback

def run_traced_code(source_code, stdin_data=""):
    start_time = time.time()
    steps = []
    output_buffer = io.StringIO()
    lines = source_code.splitlines()

    class InterceptStdout:
        def write(self, text):
            output_buffer.write(text)
        def flush(self):
            pass

    old_stdout = sys.stdout
    old_stdin = sys.stdin
    
    sys.stdout = InterceptStdout()
    sys.stdin = io.StringIO(stdin_data or "")

    def trace_lines(frame, event, arg):
        if event == 'line' and frame.f_code.co_filename == '<user_code>':
            lineno = frame.f_lineno
            line_content = lines[lineno - 1] if 0 < lineno <= len(lines) else ""
            
            # Extract clean serializable locals
            locs = {}
            for k, v in frame.f_locals.items():
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

            steps.append({
                "line": lineno,
                "lineCode": line_content,
                "variables": locs,
                "callStack": [{"frameName": frame.f_code.co_name if frame.f_code.co_name != '<module>' else 'Main Block', "line": lineno}],
                "output": output_buffer.getvalue()
            })
        return trace_lines

    compiled_code = None
    parse_error = None
    try:
        compiled_code = compile(source_code, '<user_code>', 'exec')
    except Exception as e:
        parse_error = traceback.format_exc()

    if parse_error:
        sys.stdout = old_stdout
        sys.stdin = old_stdin
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
                "explanation": "Compilation / syntax error encountered."
            }],
            "totalSteps": 1
        }

    global_scope = {"__name__": "__main__"}
    sys.settrace(trace_lines)
    exec_error = None
    try:
        exec(compiled_code, global_scope)
    except EOFError:
        exec_error = "EOFError: Code requested user input via input(), but the input stream was empty. Please provide test input in the 'Custom Input (stdin)' panel."
    except Exception as e:
        exec_error = traceback.format_exc()
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        sys.stdin = old_stdin

    elapsed = time.time() - start_time
    raw_stdout = output_buffer.getvalue()
    
    if exec_error:
        full_output = f"{raw_stdout}\n{exec_error}" if raw_stdout else exec_error
        exit_code = 1
    else:
        full_output = raw_stdout
        exit_code = 0

    compiler_banner = f"[Running] python -u \"main.py\"\n{full_output.rstrip()}\n\n[Done] exited with code={exit_code} in {elapsed:.3f} seconds"

    if steps:
        steps[-1]["output"] = full_output.rstrip()

    return {
        "steps": steps,
        "totalSteps": len(steps),
        "finalOutput": full_output.rstrip(),
        "compilerOutput": compiler_banner,
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
