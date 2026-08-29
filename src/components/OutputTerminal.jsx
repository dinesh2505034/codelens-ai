import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, CornerDownLeft } from 'lucide-react';

export default function OutputTerminal({ 
  output = '', 
  isWaitingForInput = false,
  inputPrompt = '',
  onSubmitInput,
  executionTime = '',
  exitCode = 0
}) {
  const [interactiveVal, setInteractiveVal] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto-focus input when waiting for user input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, isWaitingForInput]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSubmitInput) {
      onSubmitInput(interactiveVal);
      setInteractiveVal('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-750 transition-colors select-none">
      {/* Outer Actual Terminal Box matching reference screenshots */}
      <div className={`relative border rounded-xl p-3 bg-slate-900 dark:bg-[#12141a] text-slate-100 shadow-sm overflow-hidden transition-all ${
        isWaitingForInput 
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/40' 
          : 'border-slate-300 dark:border-slate-750'
      }`}>
        {/* Floating "Output" label in red matching reference images */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 font-mono text-[11px] font-bold">
              Output
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono">
            {output && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Real Terminal Output Console Area */}
        <div 
          ref={terminalRef}
          className="font-mono text-xs text-slate-200 min-h-[56px] max-h-36 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30 leading-5 pt-1 scroll-smooth select-text"
        >
          {output && <div>{output}</div>}

          {/* Interactive In-Terminal Input Row (When code calls input() / cin / scanf) */}
          {isWaitingForInput && (
            <form onSubmit={handleSubmit} className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800">
              <div className="flex items-center space-x-1.5 flex-1 mr-3">
                <span className="text-emerald-400 font-bold">{inputPrompt || '>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={interactiveVal}
                  onChange={(e) => setInteractiveVal(e.target.value)}
                  placeholder="Type input value here and press Enter or Submit..."
                  className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="px-3.5 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <span>Submit</span>
                <CornerDownLeft className="w-3 h-3 ml-0.5" />
              </button>
            </form>
          )}

          {!output && !isWaitingForInput && (
            <div className="text-slate-500 italic py-2">
              Terminal output will display here as execution proceeds...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
