import React, { useState } from 'react';
import { 
  X, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Wrench, 
  Sparkles, 
  Check, 
  Code,
  ShieldCheck,
  ChevronRight,
  Split,
  FileCode
} from 'lucide-react';

export default function DebuggerPanel({
  isOpen,
  onClose,
  debugData,
  onApplyFix,
  currentCode
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewDiff, setViewDiff] = useState(true);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const issues = debugData?.issues || [];
  const hasIssues = issues.length > 0;
  const fixedCode = debugData?.fixedCode || currentCode;

  const filteredIssues = issues.filter(issue => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'errors') return issue.severity?.includes('Error') || issue.type?.includes('Error');
    if (selectedFilter === 'warnings') return issue.severity?.includes('Warning') || issue.type?.includes('Warning');
    if (selectedFilter === 'logic') return issue.severity?.includes('Logic') || issue.type?.includes('Logic') || issue.type?.includes('Loop');
    return true;
  });

  const handleApply = () => {
    if (fixedCode) {
      onApplyFix(fixedCode);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${hasIssues ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'} shadow-sm`}>
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Error Detector & 1-Click Debugger
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  hasIssues 
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40' 
                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                }`}>
                  {hasIssues ? `${issues.length} Issues Found` : 'Clean & Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AST compiler syntax validator, memory safety auditor, and automatic patch generator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!hasIssues ? (
            /* Clean State */
            <div className="p-10 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                No Syntax, Compiler, or Logic Errors Detected
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
                Your code passed all static syntax compilation, memory safety, loop bound invariants, and type correctness checks.
              </p>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-dark-850 p-1 rounded-xl border border-slate-200 dark:border-dark-750 text-xs font-medium">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedFilter === 'all'
                        ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    All ({issues.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('errors')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedFilter === 'errors'
                        ? 'bg-red-500 text-white font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    Errors
                  </button>
                  <button
                    onClick={() => setSelectedFilter('warnings')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedFilter === 'warnings'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    Warnings
                  </button>
                  <button
                    onClick={() => setSelectedFilter('logic')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedFilter === 'logic'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    Logic Bugs
                  </button>
                </div>

                {/* Diff View Toggle */}
                <button
                  onClick={() => setViewDiff(!viewDiff)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-dark-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-750 transition-colors cursor-pointer"
                >
                  <Split className="w-3.5 h-3.5 text-blue-500" />
                  <span>{viewDiff ? 'Hide Code Diff' : 'Show Code Diff'}</span>
                </button>
              </div>

              {/* Issue Cards */}
              <div className="space-y-3">
                {filteredIssues.map((issue, idx) => {
                  const isErr = issue.severity?.includes('Error') || issue.type?.includes('Error');
                  const isLogic = issue.severity?.includes('Logic') || issue.type?.includes('Logic') || issue.type?.includes('Loop');
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isErr
                          ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-500/30'
                          : isLogic
                          ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/30'
                          : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            isErr
                              ? 'bg-red-500 text-white'
                              : isLogic
                              ? 'bg-purple-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            Line {issue.line}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {issue.type || 'Syntax/Logic Issue'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isErr ? 'text-red-600 dark:text-red-400' : isLogic ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {issue.severity || 'Error'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-mono">
                        {issue.message}
                      </p>

                      {issue.suggestion && (
                        <div className="mt-2.5 p-2 rounded-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 flex items-start space-x-2 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white">AI Fix:</strong> {issue.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Side-by-Side Visual Diff Preview */}
              {viewDiff && fixedCode && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5">
                      <FileCode className="w-4 h-4 text-blue-600 dark:text-brand-cyan" />
                      <span>1-Click Patch Preview (Before vs AI Fixed)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="rounded-xl border border-red-200 dark:border-red-500/30 overflow-hidden bg-red-50/30 dark:bg-dark-950 flex flex-col">
                      <div className="px-3 py-1.5 bg-red-100/60 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[11px] font-mono font-bold border-b border-red-200 dark:border-red-500/30 flex items-center justify-between">
                        <span>Original Code</span>
                        <span className="text-[10px]">Errors Present</span>
                      </div>
                      <pre className="p-3 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre leading-5">
                        {currentCode}
                      </pre>
                    </div>

                    {/* After */}
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 overflow-hidden bg-emerald-50/30 dark:bg-dark-950 flex flex-col">
                      <div className="px-3 py-1.5 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-bold border-b border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
                        <span>CodeLens AI Repaired Code</span>
                        <span className="text-[10px]">Verified Safe</span>
                      </div>
                      <pre className="p-3 font-mono text-xs text-emerald-900 dark:text-emerald-300 overflow-x-auto whitespace-pre leading-5">
                        {fixedCode}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with 1-Click Fix Button */}
        {hasIssues && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-dark-850 border-t border-slate-200 dark:border-dark-750 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-sans hidden sm:inline">
              Clicking apply will rewrite the editor with the verified AI patch.
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-750 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={handleApply}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                  applied
                    ? 'bg-emerald-600 text-white scale-105'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {applied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Applied Fix Successfully!</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-white" />
                    <span>Apply 1-Click AI Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
