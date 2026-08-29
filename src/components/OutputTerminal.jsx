import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OutputTerminal({ 
  output, 
  compilerOutput, 
  exitCode = 0, 
  executionTime = '0.020s',
  language = 'python'
}) {
  const [viewMode, setViewMode] = useState('compiler'); // 'compiler' | 'step'
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef(null);

  const displayContent = viewMode === 'compiler' 
    ? (compilerOutput || output || 'Execution finished with no output.')
    : (output || 'Program output will stream here as steps execute...');

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayContent]);

  return (
    <div className="p-3 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-750 transition-colors select-none">
      {/* Outer Compiler Terminal Box */}
      <div className="relative border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 bg-slate-900 text-slate-100 shadow-sm overflow-hidden">
        {/* Floating "Output" Header label matching reference screenshot */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-red-600/20 text-red-400 font-mono text-[11px] font-bold rounded border border-red-500/30">
              Output / Terminal
            </span>

            {/* View Mode Toggle: Compiler Stream vs Step Output */}
            <div className="flex items-center bg-slate-800 rounded-md p-0.5 text-[10px] font-mono border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('compiler')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  viewMode === 'compiler'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Compiler
              </button>
              <button
                type="button"
                onClick={() => setViewMode('step')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  viewMode === 'step'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Step Sync
              </button>
            </div>
          </div>

          {/* Right Action Badges & Copy */}
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            {executionTime && (
              <span className="text-slate-400 hidden sm:inline">
                ⏱ {executionTime}
              </span>
            )}
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              exitCode === 0 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {exitCode === 0 ? 'exit: 0' : `exit: ${exitCode}`}
            </span>
            <button
              onClick={handleCopy}
              disabled={!displayContent}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Terminal Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Real Monospace Terminal Console Stream */}
        <div 
          ref={terminalRef}
          className="font-mono text-xs text-slate-200 min-h-[64px] max-h-36 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30 leading-5 pt-1 scroll-smooth select-text"
        >
          {displayContent}
        </div>
      </div>
    </div>
  );
}
