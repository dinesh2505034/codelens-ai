import React, { useState, useEffect } from 'react';
import { X, Settings, Cpu, ShieldCheck, Sun, Moon, Key } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme = 'dark',
  onToggleTheme
}) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('codelens_gemini_api_key') || '');
  const [savedKey, setSavedKey] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem('codelens_gemini_api_key') || '');
  }, [isOpen]);

  const handleSaveApiKey = (val) => {
    setApiKey(val);
    localStorage.setItem('codelens_gemini_api_key', val.trim());
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-fadeIn select-none">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[12px] w-full max-w-md shadow-modal overflow-hidden transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#5B6CFF]" />
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Preferences & Configuration
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 font-sans text-xs">
          {/* Theme Option */}
          <div className="flex items-center justify-between p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <div>
              <div className="font-medium text-[var(--text-main)]">Interface Theme</div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Toggle between dark and light modes</p>
            </div>

            <div className="flex items-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)] p-0.5">
              <button
                onClick={() => theme !== 'light' && onToggleTheme()}
                className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-[4px] cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-[4px] cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Gemini API Key (Optional) */}
          <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-medium text-[var(--text-main)]">
                <Key className="w-3.5 h-3.5 text-[#5B6CFF]" />
                <span>Google Gemini API Key</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Optional</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Used for optional cloud AI reasoning and image OCR. If left blank, the app uses native compiler diagnostics.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[6px] px-2.5 py-1.5 font-mono text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[#5B6CFF]"
              />
            </div>
            {savedKey && (
              <span className="text-[10px] text-[var(--status-success)] font-medium block">
                Saved to browser storage
              </span>
            )}
          </div>

          {/* Execution Environment Status */}
          <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-medium text-[var(--text-main)]">
              <Cpu className="w-3.5 h-3.5 text-[#5B6CFF]" />
              <span>Compiler Runtimes</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)]">
                <span>Python</span>
                <span className="text-[var(--status-success)]">3.11</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)]">
                <span>GCC / G++</span>
                <span className="text-[var(--status-success)]">12.2</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)]">
                <span>Java JDK</span>
                <span className="text-[var(--status-success)]">17.0</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-app)] border border-[var(--border-color)]">
                <span>Sandbox</span>
                <span className="text-[var(--text-main)]">Active</span>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" />
            <span>Zero-mock execution: All output is verified by real local compilers.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#5B6CFF] hover:bg-[#4858EC] text-white shadow-xs cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
