import React, { useState } from 'react';
import { 
  X, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Split,
  FileCode,
  Wrench
} from 'lucide-react';

export default function DebuggerPanel({
  isOpen,
  onClose,
  debugData,
  isLoading = false,
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
    if (selectedFilter === 'errors') return issue.severity?.toLowerCase().includes('error') || issue.type?.toLowerCase().includes('error');
    if (selectedFilter === 'warnings') return issue.severity?.toLowerCase().includes('warning') || issue.type?.toLowerCase().includes('warning');
    if (selectedFilter === 'logic') return issue.severity?.toLowerCase().includes('logic') || issue.type?.toLowerCase().includes('logic');
    return true;
  });

  const handleApply = () => {
    if (fixedCode) {
      onApplyFix(fixedCode);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-fadeIn select-none">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[12px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-modal overflow-hidden transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-sm font-semibold text-[var(--text-main)] flex items-center space-x-2">
              <Bug className="w-4 h-4 text-[#5B6CFF]" />
              <span>Compiler Diagnostics & Debugger</span>
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              hasIssues 
                ? 'text-[var(--status-error)] bg-[var(--status-error-bg)] border-[var(--status-error-border)]' 
                : 'text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success-border)]'
            }`}>
              {hasIssues ? `${issues.length} Issues Detected` : 'All Checks Passed'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text font-sans text-xs">
          {!hasIssues ? (
            /* Clean State */
            <div className="p-8 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                No Syntax or Compilation Errors Found
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                Source code passed real compiler syntax checks, AST structure verification, and loop invariant validation.
              </p>
            </div>
          ) : (
            <>
              {/* Filter Tabs & Diff Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)] p-0.5">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2.5 py-0.5 text-xs rounded-[4px] cursor-pointer ${
                      selectedFilter === 'all'
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    All ({issues.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('errors')}
                    className={`px-2.5 py-0.5 text-xs rounded-[4px] cursor-pointer ${
                      selectedFilter === 'errors'
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    Errors
                  </button>
                  <button
                    onClick={() => setSelectedFilter('warnings')}
                    className={`px-2.5 py-0.5 text-xs rounded-[4px] cursor-pointer ${
                      selectedFilter === 'warnings'
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    Warnings
                  </button>
                </div>

                <button
                  onClick={() => setViewDiff(!viewDiff)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>{viewDiff ? 'Hide Patch Diff' : 'Show Patch Diff'}</span>
                </button>
              </div>

              {/* Issue List */}
              <div className="space-y-2.5">
                {filteredIssues.map((issue, idx) => {
                  const isErr = issue.severity?.toLowerCase().includes('error') || issue.type?.toLowerCase().includes('error');
                  
                  return (
                    <div 
                      key={idx}
                      className="p-3 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-app)] px-1.5 py-0.2 rounded border border-[var(--border-color)]">
                            Line {issue.line}
                          </span>
                          <span className="font-semibold text-xs text-[var(--text-main)]">
                            {issue.type || 'Compiler Diagnostic'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-medium ${
                          isErr ? 'text-[var(--status-error)]' : 'text-[var(--status-warning)]'
                        }`}>
                          {issue.severity || 'Error'}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-main)] font-mono leading-relaxed opacity-90">
                        {issue.message}
                      </p>

                      {issue.suggestion && (
                        <div className="text-[11px] text-[var(--text-muted)] pt-1 flex items-start space-x-1.5">
                          <span className="text-[#5B6CFF] font-medium select-none">Fix:</span>
                          <span>{issue.suggestion}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Code Diff Preview */}
              {viewDiff && fixedCode && fixedCode !== currentCode && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Patch Preview (Current vs Repaired)</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="rounded-[8px] border border-[var(--status-error-border)] bg-[var(--bg-app)] overflow-hidden flex flex-col">
                      <div className="px-3 py-1 bg-[var(--status-error-bg)] text-[var(--status-error)] text-[11px] font-mono font-medium border-b border-[var(--status-error-border)]">
                        Original Code
                      </div>
                      <pre className="p-3 font-mono text-xs text-[var(--text-main)] overflow-x-auto whitespace-pre leading-5 opacity-80">
                        {currentCode}
                      </pre>
                    </div>

                    {/* After */}
                    <div className="rounded-[8px] border border-[var(--status-success-border)] bg-[var(--bg-app)] overflow-hidden flex flex-col">
                      <div className="px-3 py-1 bg-[var(--status-success-bg)] text-[var(--status-success)] text-[11px] font-mono font-medium border-b border-[var(--status-success-border)]">
                        Repaired Code
                      </div>
                      <pre className="p-3 font-mono text-xs text-[var(--text-main)] overflow-x-auto whitespace-pre leading-5">
                        {fixedCode}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            {issues.length} {issues.length === 1 ? 'issue found' : 'issues found'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[6px] text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
            >
              Close
            </button>
            {hasIssues && fixedCode && fixedCode !== currentCode && (
              <button
                onClick={handleApply}
                disabled={applied}
                className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#5B6CFF] hover:bg-[#4858EC] text-white shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                {applied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Apply 1-Click Fix</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
