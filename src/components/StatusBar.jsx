import React from 'react';
import { Terminal, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';

export default function StatusBar({
  language = 'python',
  lineCount = 1,
  status = 'Ready',
  executionTime = '-',
  currentStep = null,
  totalSteps = null,
  hasError = false
}) {
  const getLanguageLabel = () => {
    switch (language) {
      case 'cpp': return 'C++17 (g++)';
      case 'c': return 'C11 (gcc)';
      case 'java': return 'Java 17 (javac)';
      default: return 'Python 3.11';
    }
  };

  const isRunning = status === 'Running';
  const isDone = status === 'Done';
  const isFailed = status === 'Error' || hasError;

  return (
    <footer className="h-6 w-full bg-[var(--bg-surface)] border-t border-[var(--border-color)] px-3 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] select-none z-20">
      {/* Left Items */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-[var(--text-main)] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B6CFF]" />
          <span>{getLanguageLabel()}</span>
        </div>

        <span className="text-[var(--border-color)]">|</span>

        <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>

        <span className="text-[var(--border-color)] hidden md:inline">|</span>
        <span className="hidden md:inline">UTF-8</span>

        <span className="text-[var(--border-color)] hidden md:inline">|</span>
        <span className="hidden md:inline">Spaces: 4</span>
      </div>

      {/* Right Items */}
      <div className="flex items-center space-x-3">
        {/* Step Indicator */}
        {currentStep && totalSteps && (
          <>
            <span className="text-[var(--text-main)]">
              Step {currentStep}/{totalSteps}
            </span>
            <span className="text-[var(--border-color)]">|</span>
          </>
        )}

        {/* Execution Status */}
        <div className="flex items-center space-x-1.5">
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 text-[#5B6CFF] animate-spin" />
              <span className="text-[#5B6CFF]">Running...</span>
            </>
          ) : isFailed ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--status-error)]" />
              <span className="text-[var(--status-error)]">Execution Error</span>
            </>
          ) : isDone ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)]" />
              <span className="text-[var(--text-main)]">Done ({executionTime})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-60" />
              <span>Ready</span>
            </>
          )}
        </div>

        <span className="text-[var(--border-color)] hidden sm:inline">|</span>

        {/* Shortcut Hint */}
        <div className="hidden sm:flex items-center space-x-1 text-[var(--text-muted)]">
          <span>Run</span>
          <kbd className="px-1 py-0.2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded text-[10px]">
            Ctrl+↵
          </kbd>
        </div>
      </div>
    </footer>
  );
}
