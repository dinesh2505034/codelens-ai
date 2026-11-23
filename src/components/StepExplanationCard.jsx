import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  Info
} from 'lucide-react';
import MathText from './MathText';

export default function StepExplanationCard({
  activeLine,
  lineCode,
  explanation,
  statusText,
  currentStep,
  totalSteps,
  hasError = false,
  errorDiagnostic = null
}) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  const isError = hasError || (explanation && explanation.startsWith('❌')) || Boolean(errorDiagnostic);
  const diag = errorDiagnostic;

  return (
    <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex flex-col space-y-2 select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
          {isError ? 'Error Diagnostic' : 'Step Explanation'}
        </span>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {activeLine ? `Line ${activeLine}` : 'Execution Scope'}
        </span>
      </div>

      {/* Line Code Box */}
      {lineCode && (
        <div className="px-2.5 py-1.5 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)] font-mono text-xs text-[var(--text-main)] truncate">
          <span className="text-[var(--text-muted)] mr-2 select-none">{activeLine}</span>
          <span>{lineCode}</span>
        </div>
      )}

      {/* Main Explanation Block */}
      <div className={`p-2.5 rounded-[6px] border text-xs leading-relaxed font-sans ${
        isError
          ? 'bg-[var(--status-error-bg)] border-[var(--status-error-border)] text-[var(--status-error)]'
          : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-main)]'
      }`}>
        <MathText text={diag?.summary || explanation || 'Executing statement...'} />
      </div>

      {/* 7-Point Structured Diagnostic for Errors */}
      {isError && diag && (
        <div className="rounded-[6px] border border-[var(--status-error-border)] bg-[var(--bg-app)] p-2.5 space-y-2 text-xs select-text font-sans">
          <div 
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="flex items-center justify-between text-xs font-semibold text-[var(--status-error)] cursor-pointer select-none"
          >
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Diagnostic Breakdown (7 Points)</span>
            </div>
            {showDetailedBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>

          {showDetailedBreakdown && (
            <div className="space-y-1.5 pt-1.5 border-t border-[var(--border-color)] text-xs">
              {/* 1. Expected */}
              {diag.expected && (
                <div className="flex items-start space-x-2">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold mt-0.5">1.</span>
                  <div>
                    <span className="text-[var(--text-muted)]">Expected: </span>
                    <span className="font-mono text-[11px] text-[var(--text-main)]">{diag.expected}</span>
                  </div>
                </div>
              )}

              {/* 2. Received */}
              {diag.received && (
                <div className="flex items-start space-x-2">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold mt-0.5">2.</span>
                  <div>
                    <span className="text-[var(--text-muted)]">Received: </span>
                    <span className="font-mono text-[11px] text-[var(--status-error)]">{diag.received}</span>
                  </div>
                </div>
              )}

              {/* 3. Reason */}
              {diag.reason && (
                <div className="flex items-start space-x-2">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold mt-0.5">3.</span>
                  <div>
                    <span className="text-[var(--text-muted)]">Reason: </span>
                    <span className="text-[var(--text-main)]">{diag.reason}</span>
                  </div>
                </div>
              )}

              {/* 4. Fix Suggestion */}
              {diag.suggestion && (
                <div className="flex items-start space-x-2">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold mt-0.5">4.</span>
                  <div>
                    <span className="text-[var(--text-muted)]">Suggested Fix: </span>
                    <span className="font-mono text-[11px] text-[var(--text-main)] bg-[var(--bg-surface)] px-1 py-0.2 rounded border border-[var(--border-color)]">
                      {diag.suggestion}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
