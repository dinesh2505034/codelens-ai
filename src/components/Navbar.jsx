import React from 'react';
import { 
  Code2, 
  Sparkles, 
  Bug, 
  Camera, 
  Share2, 
  Settings, 
  Zap,
  Sun,
  Moon,
  Eye,
  Scan
} from 'lucide-react';

export default function Navbar({
  language,
  setLanguage,
  aiMode,
  setAiMode,
  onOpenOCR,
  onOpenExplain,
  onOpenDebugger,
  onOpenShare,
  onOpenSettings,
  hasErrors,
  issueCount,
  theme,
  onToggleTheme
}) {
  const languages = [
    { id: 'python', label: 'Python', ext: '.py' },
    { id: 'cpp', label: 'C++', ext: '.cpp' },
    { id: 'c', label: 'C', ext: '.c' },
    { id: 'java', label: 'Java', ext: '.java' }
  ];

  return (
    <header className="bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-750 px-4 py-2.5 flex items-center justify-between shadow-xs select-none sticky top-0 z-30 transition-colors">
      {/* Brand & AI Engine */}
      <div className="flex items-center space-x-3">
        {/* Custom CodeLens Crystal Lens Logo */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 dark:from-cyan-500/15 dark:via-blue-500/15 dark:to-indigo-500/15 border border-blue-200 dark:border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-xs">
          <div className="relative flex items-center justify-center">
            {/* Crystal Lens Icon Graphic */}
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-white dark:bg-dark-950 rounded-[6px] flex items-center justify-center relative overflow-hidden">
                <Scan className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span className="absolute inset-0 bg-blue-500/10 animate-pulse"></span>
              </div>
            </div>
            {/* Pulsing Active Neural Glow */}
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
          
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:via-white dark:to-blue-400 dark:bg-clip-text">
            CodeLens <span className="text-[11px] font-black uppercase text-blue-700 dark:text-cyan-300 bg-blue-100 dark:bg-dark-950 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-cyan-500/30 ml-0.5 tracking-wider">AI</span>
          </span>
        </div>

        {/* AI Engine Switcher */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-dark-750 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setAiMode('native')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              aiMode === 'native'
                ? 'bg-blue-600 dark:bg-brand-blue text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Fast built-in AST semantic code explanation & visual generator"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>CodeLens Native</span>
          </button>
          <button
            onClick={() => setAiMode('cloud')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              aiMode === 'cloud'
                ? 'bg-purple-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Google Gemini Cloud AI"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Cloud Gemini</span>
          </button>
        </div>
      </div>

      {/* Center Controls: Language & Image OCR */}
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <div className="relative flex items-center bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-dark-750 rounded-lg px-2.5 py-1 shadow-xs">
          <Code2 className="w-4 h-4 text-blue-600 dark:text-brand-cyan mr-1.5" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200">
                {l.label} ({l.ext})
              </option>
            ))}
          </select>
        </div>

        {/* OCR Image-to-Code Button */}
        <button
          onClick={onOpenOCR}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 hover:border-blue-400 dark:hover:border-brand-cyan/50 transition-all shadow-xs group cursor-pointer"
          title="Upload or scan image of code"
        >
          <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Image to Code</span>
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-700 transition-all cursor-pointer"
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Deep AI Explainer Button */}
        <button
          onClick={onOpenExplain}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs hover:shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          title="Generate deep AI code explanation & complexity report"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
          <span className="hidden md:inline">Deep AI Explain</span>
          <span className="md:hidden">Explain</span>
        </button>

        {/* AI Debugger Button */}
        <button
          onClick={onOpenDebugger}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            hasErrors
              ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/50 hover:bg-red-100 dark:hover:bg-red-500/30 animate-pulse'
              : 'bg-slate-100 dark:bg-dark-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-750'
          }`}
          title="Detect errors and 1-click auto fix"
        >
          <Bug className={`w-3.5 h-3.5 ${hasErrors ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`} />
          <span className="hidden lg:inline">AI Debugger</span>
          {hasErrors && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {issueCount}
            </span>
          )}
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-700 transition-all cursor-pointer"
          title="Generate shareable link"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-emerald" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-dark-750 transition-all cursor-pointer"
          title="Settings & API Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
