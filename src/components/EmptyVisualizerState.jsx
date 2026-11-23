import React from 'react';
import { Terminal } from 'lucide-react';

export default function EmptyVisualizerState() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bg-app)] text-center select-none">
      <div className="flex flex-col items-center space-y-3 max-w-xs">
        {/* Subtle, Engineering-Grade Icon */}
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shadow-subtle">
          <Terminal className="w-5 h-5 opacity-70" />
        </div>

        {/* One-line hint */}
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Run your code to see execution output
        </p>

        {/* Keyboard shortcut hint */}
        <div className="flex items-center space-x-1.5 pt-1 text-[11px] text-[var(--text-muted)]">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[4px] font-mono text-[10px] text-[var(--text-main)] shadow-subtle">
            {isMac ? '⌘ + ↵' : 'Ctrl + Enter'}
          </kbd>
        </div>
      </div>
    </div>
  );
}
