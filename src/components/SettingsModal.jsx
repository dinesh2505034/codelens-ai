import React, { useState } from 'react';
import { X, Settings, Key, Bot, Zap, Check, Eye, EyeOff } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  aiMode,
  setAiMode,
  apiKey,
  setApiKey
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(keyInput.trim());
    localStorage.setItem('gemini_api_key', keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
                Preferences & AI Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure execution and AI intelligence models
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
          {/* AI Engine Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active AI Intelligence Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAiMode('native')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                  aiMode === 'native'
                    ? 'bg-blue-50 dark:bg-brand-blue/15 border-blue-400 dark:border-brand-cyan text-blue-700 dark:text-brand-cyan font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-dark-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs">
                  <Bot className="w-4 h-4" />
                  <span>CodeLens Native</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Built-in AST reasoning & 60fps instant tracer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAiMode('cloud')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                  aiMode === 'cloud'
                    ? 'bg-purple-50 dark:bg-purple-600/15 border-purple-400 dark:border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-dark-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs">
                  <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Cloud Gemini AI</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Multimodal vision & deep conversational AI
                </span>
              </button>
            </div>
          </div>

          {/* Gemini API Key (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-750 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-brand-cyan pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Only required if using Cloud Gemini Mode. Key is saved locally in your browser.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
