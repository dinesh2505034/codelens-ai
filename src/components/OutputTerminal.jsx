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
    <div className="flex flex-col h-full w-full bg-[var(--bg-surface)] p-3 select-none">
      {/* Terminal Block - Engineering Grade */}
      <div className={`flex-1 flex flex-col rounded-lg border bg-[var(--bg-app)] overflow-hidden transition-all ${
        isWaitingForInput 
          ? 'border-[#5B6CFF] ring-1 ring-[#5B6CFF]/30' 
          : 'border-[var(--border-color)]'
      }`}>
        {/* Terminal Header Bar */}
        <div className="h-8 px-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
              Terminal Output
            </span>
            {exitCode !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                exitCode === 0 
                  ? 'text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success-border)]'
                  : 'text-[var(--status-error)] bg-[var(--status-error-bg)] border-[var(--status-error-border)]'
              }`}>
                exit: {exitCode}
              </span>
            )}
            {executionTime && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {executionTime}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {output && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
                title="Copy terminal output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Monospace Output Text Area */}
        <div 
          ref={terminalRef}
          className="flex-1 p-3 font-mono text-xs text-[var(--text-main)] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text min-h-[140px]"
        >
          {output ? (
            <div>{output}</div>
          ) : (
            <div className="text-[var(--text-muted)] opacity-50 italic">
              No console output generated.
            </div>
          )}

          {/* Stdin Interactive Input Field */}
          {isWaitingForInput && (
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-2 pt-2 border-t border-[var(--border-color)]">
              <span className="text-[#5B6CFF] font-bold">{inputPrompt || '>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={interactiveVal}
                onChange={(e) => setInteractiveVal(e.target.value)}
                placeholder="Enter input..."
                className="flex-1 bg-transparent border-none text-xs font-mono text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-muted)]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#5B6CFF] hover:bg-[#4858EC] text-white text-xs font-medium rounded-[4px] cursor-pointer flex items-center space-x-1"
              >
                <span>Send</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
