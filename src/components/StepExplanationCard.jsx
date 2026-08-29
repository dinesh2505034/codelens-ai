import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Check, 
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  const isFinished = currentStep >= totalSteps;
  const isError = hasError || (explanation && explanation.startsWith('❌')) || Boolean(errorDiagnostic);

  const diag = errorDiagnostic;

  return (
    <div className="p-3 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-750 flex flex-col space-y-2 select-none transition-colors max-h-[360px] overflow-y-auto">
      {/* Explanation of this code header */}
      <div className="space-y-1">
        <div className={`text-[11px] font-mono font-bold tracking-wide flex items-center justify-between ${
          isError ? 'text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400'
        }`}>
          <span>{isError ? 'Runtime Error Diagnosis:' : 'Explanation of this code:'}</span>
          {isError && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/60 animate-pulse">
              Exception Encountered
            </span>
          )}
        </div>

        {lineCode && (
          <div className={`font-mono text-xs px-2.5 py-1.5 rounded border truncate ${
            isError 
              ? 'bg-red-500/10 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 font-semibold' 
              : 'bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-dark-800'
          }`}>
            {lineCode}
          </div>
        )}
      </div>

      {/* Primary Explanation Commentary */}
      <div className={`rounded-lg p-3 text-xs leading-relaxed shadow-xs flex items-start space-x-2.5 border transition-all ${
        isError
          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700/70 text-red-900 dark:text-red-200'
          : 'bg-slate-50 dark:bg-dark-950/80 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
      }`}>
        {isError ? (
          <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-brand-cyan flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 font-sans space-y-1">
          <p className={isError ? 'font-medium leading-5' : 'font-normal'}>
            {diag?.summary || explanation || 'Executing step...'}
          </p>
        </div>
      </div>

      {/* 7-Point Structured Diagnostic Breakdown for Runtime & Conversion Errors */}
      {isError && diag && (
        <div className="bg-red-50/70 dark:bg-dark-950/90 border border-red-200 dark:border-red-900/60 rounded-xl p-3 space-y-2.5 text-xs select-text">
          <div 
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="flex items-center justify-between text-xs font-bold text-red-800 dark:text-red-300 cursor-pointer select-none"
          >
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Detailed Error Breakdown (7 Points)</span>
            </div>
            {showDetailedBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>

          {showDetailedBreakdown && (
            <div className="space-y-2 pt-1 font-sans border-t border-red-200 dark:border-red-900/50">
              {/* 1. What the program expected */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Program Expected: </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-slate-100 dark:bg-dark-800 px-1.5 py-0.2 rounded">
                    {diag.expected}
                  </span>
                </div>
              </div>

              {/* 2. What the user actually entered */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">User Entered: </span>
                  <span className="text-amber-700 dark:text-amber-400 font-mono font-bold text-[11px] bg-amber-100/60 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700/50">
                    {diag.received}
                  </span>
                </div>
              </div>

              {/* 3. Which operation failed */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Failed Operation: </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800/40">
                    {diag.failedOperation}
                  </span>
                </div>
              </div>

              {/* 4. Why the conversion failed */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Why It Failed: </span>
                  <span className="text-red-800 dark:text-red-300">
                    {diag.whyFailed}
                  </span>
                </div>
              </div>

              {/* 5. What exception Python generated */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-red-200 dark:bg-red-800/50 text-red-900 dark:text-red-200 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Exception Generated: </span>
                  <code className="text-red-700 dark:text-red-300 font-mono text-[11px] font-bold">
                    {diag.exception}
                  </code>
                </div>
              </div>

              {/* 6. How the user can fix the input */}
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  6
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">How to Fix: </span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                    {diag.howToFix}
                  </span>
                </div>
              </div>

              {/* 7. Show a corrected example */}
              <div className="flex items-start space-x-2 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  7
                </span>
                <div className="flex-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Corrected Example: </span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs bg-white dark:bg-dark-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/60 ml-1">
                    {diag.example}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Status Box */}
      <div className={`text-xs font-mono px-3 py-1.5 rounded-md border flex items-center justify-between ${
        isError
          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40 font-semibold'
          : isFinished 
          ? 'bg-emerald-50 dark:bg-dark-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 font-medium' 
          : 'bg-slate-50 dark:bg-dark-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-800'
      }`}>
        <div className="flex items-center space-x-1.5">
          {isError ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{statusText || `Step ${currentStep} of ${totalSteps} executed.`}</span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">CodeLens Diagnostic Engine</span>
      </div>
    </div>
  );
}
