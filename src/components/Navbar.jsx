import React from 'react';
import BrandLogo from './BrandLogo';
import { 
  Code2, 
  Sparkles, 
  Bug, 
  Camera, 
  Share2, 
  Settings, 
  Sun, 
  Moon, 
  Play,
  Square,
  ChevronDown,
  Layers
} from 'lucide-react';

export default function Navbar({
  language = 'python',
  setLanguage,
  activePreset = '',
  onSelectPreset,
  presets = [],
  onOpenOCR,
  onOpenExplain,
  onOpenDebugger,
  onOpenShare,
  onOpenSettings,
  hasErrors = false,
  issueCount = 0,
  onRunCode,
  onResetCode,
  isRunning = false,
  theme = 'dark',
  onToggleTheme
}) {
  const languages = [
    { id: 'python', label: 'Python', ext: '.py' },
    { id: 'cpp', label: 'C++', ext: '.cpp' },
    { id: 'c', label: 'C', ext: '.c' },
    { id: 'java', label: 'Java', ext: '.java' }
  ];

  return (
    <header className="h-12 w-full bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-3 flex items-center justify-between select-none sticky top-0 z-30 transition-colors">
      {/* Left: Brand Logo + Language Selector */}
      <div className="flex items-center space-x-3">
        {/* Official Brand Logo */}
        <BrandLogo size={24} textClassName="text-sm font-semibold" />

        <div className="h-4 w-[1px] bg-[var(--border-color)]" />

        {/* Language Selector */}
        <div className="relative flex items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none bg-transparent hover:bg-[var(--accent-subtle)] text-xs font-mono font-medium text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded-[6px] pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5B6CFF]"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id} className="bg-[var(--bg-surface)] text-[var(--text-main)] font-mono">
                {l.label} ({l.ext})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* Center: Mode / Presets Selector */}
      <div className="hidden md:flex items-center space-x-2">
        {presets && presets.length > 0 && (
          <div className="relative flex items-center">
            <Layers className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
            <select
              value={activePreset || ''}
              onChange={(e) => onSelectPreset && onSelectPreset(e.target.value)}
              className="appearance-none bg-transparent hover:bg-[var(--accent-subtle)] text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded-[6px] pl-7 pr-6 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5B6CFF] max-w-[220px] truncate"
              title="Load example preset"
            >
              <option value="" disabled className="bg-[var(--bg-surface)] text-[var(--text-muted)]">
                Select Example Preset...
              </option>
              {presets.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--bg-surface)] text-[var(--text-main)]">
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Right: Actions & Run Button */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* OCR Image-to-Code Button (Ghost) */}
        <button
          onClick={onOpenOCR}
          className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          title="Upload or scan image of code (OCR)"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* AI Debugger Button (Ghost) */}
        <button
          onClick={onOpenDebugger}
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-[6px] text-xs font-medium cursor-pointer ${
            hasErrors
              ? 'text-[var(--status-error)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)]'
          }`}
          title="AI Compiler & Runtime Debugger"
        >
          <Bug className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Debug</span>
          {hasErrors && issueCount > 0 && (
            <span className="px-1 py-0.2 rounded text-[10px] font-mono font-semibold bg-[var(--status-error)] text-white">
              {issueCount}
            </span>
          )}
        </button>

        {/* Deep AI Explainer Button (Secondary Outlined, NOT a loud gradient) */}
        <button
          onClick={onOpenExplain}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          title="Generate algorithmic complexity & code explanation"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5B6CFF]" />
          <span className="hidden sm:inline">Explain</span>
        </button>

        {/* Share Button (Ghost) */}
        <button
          onClick={onOpenShare}
          className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          title="Share code and trace"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Settings Button (Ghost) */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          title="Preferences & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme Switcher Button (Ghost) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="h-4 w-[1px] bg-[var(--border-color)] mx-1" />

        {/* Primary Run / Stop Button */}
        {isRunning ? (
          <button
            onClick={onResetCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium bg-[var(--status-error)] hover:opacity-90 text-white shadow-xs cursor-pointer active:scale-95"
            title="Stop execution"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={onRunCode}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#5B6CFF] hover:bg-[#4858EC] text-white shadow-xs cursor-pointer active:scale-95"
            title="Execute code (Ctrl + Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        )}
      </div>
    </header>
  );
}
