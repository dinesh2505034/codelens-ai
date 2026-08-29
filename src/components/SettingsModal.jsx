import React from 'react';
import { X, Settings, Bot, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onToggleTheme
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-dark-750 text-slate-700 dark:text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure appearance and execution engine settings
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

        {/* Body */}
        <div className="p-6 space-y-5 font-sans">
          {/* Engine Info Box */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-dark-950 border border-blue-200 dark:border-cyan-500/30 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                CodeLens Native AI Engine
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Powered by native AST execution tracing, 60fps real-time memory visualizer, and local Optical Character Recognition.
              </p>
            </div>
          </div>

          {/* Theme Option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-750">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <span>Theme Appearance</span>
            </div>

            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-dark-750 border border-slate-200 dark:border-dark-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 shadow-xs cursor-pointer"
            >
              {theme === 'light' ? 'Light Theme ☀️' : 'Dark Theme 🌙'}
            </button>
          </div>

          {/* Privacy & Security */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>100% private: All code traces and analyses execute securely on your dedicated server.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-dark-850 border-t border-slate-200 dark:border-dark-750 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
