import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function StepExplanationCard({
  activeLine,
  lineCode,
  explanation,
  statusText,
  currentStep,
  totalSteps
}) {
  const isFinished = currentStep >= totalSteps;

  return (
    <div className="p-3 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-750 flex flex-col space-y-2 select-none transition-colors">
      {/* Explanation of this code header matching reference screenshot */}
      <div className="space-y-1">
        <div className="text-[11px] font-mono text-red-600 dark:text-red-400 font-bold tracking-wide">
          Explanation of this code:
        </div>
        {lineCode && (
          <div className="font-mono text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-dark-950 px-2.5 py-1.5 rounded border border-slate-200 dark:border-dark-800 truncate">
            {lineCode}
          </div>
        )}
      </div>

      {/* Deep Plain-English Commentary Card */}
      <div className="bg-slate-50 dark:bg-dark-950/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-xs flex items-start space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan flex-shrink-0 mt-0.5" />
        <span className="flex-1 font-sans font-normal">{explanation || 'Executing step...'}</span>
      </div>

      {/* Step Status Box */}
      <div className={`text-xs font-mono px-3 py-1.5 rounded-md border flex items-center justify-between ${
        isFinished 
          ? 'bg-emerald-50 dark:bg-dark-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 font-medium' 
          : 'bg-slate-50 dark:bg-dark-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-800'
      }`}>
        <div className="flex items-center space-x-1.5">
          {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          <span>{statusText || `Step ${currentStep} of ${totalSteps} executed.`}</span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">CodeLens Step Tracer</span>
      </div>
    </div>
  );
}
