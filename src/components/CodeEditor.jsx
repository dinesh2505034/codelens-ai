import React, { useRef, useEffect } from 'react';
import { Play, Square, Copy, Check, FileCode2, AlertCircle } from 'lucide-react';

const FONT_STYLE = {
  fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  fontSize: '14px',
  lineHeight: '24px',
  letterSpacing: '0px',
  tabSize: 4
};

export default function CodeEditor({
  code,
  onChange,
  language,
  activeLine,
  isRunning,
  onRun,
  onStop,
  errors = []
}) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const overlayRef = useRef(null);

  const lines = (code || '').split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const getFileName = () => {
    switch (language) {
      case 'python': return 'main.py';
      case 'cpp': return 'main.cpp';
      case 'c': return 'main.c';
      case 'java': return 'Main.java';
      default: return 'script.py';
    }
  };

  // Syntax highlighter tokens generator
  const renderHighlightedLine = (lineStr, lineNum) => {
    const isCurrentLine = activeLine === lineNum;
    const hasErrorOnLine = errors.some(e => e.line === lineNum);
    const tokens = tokenizeLine(lineStr, language);

    return (
      <div 
        key={lineNum} 
        style={{ height: '24px', lineHeight: '24px' }}
        className={`relative flex items-center px-4 w-full select-none ${
          isCurrentLine 
            ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 font-semibold' 
            : hasErrorOnLine
            ? 'bg-red-500/10 text-red-950 dark:text-red-100'
            : ''
        }`}
      >
        {/* Active Line Left Marker Pointer */}
        {isCurrentLine && (
          <div className="absolute left-1 top-0 bottom-0 flex items-center pointer-events-none">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black animate-pulse">▶</span>
          </div>
        )}

        {/* Syntax Highlighted Text */}
        <div className="whitespace-pre">
          {tokens.map((token, tIdx) => (
            <span key={tIdx} className={token.className}>
              {token.text}
            </span>
          ))}
          {lineStr.length === 0 && <span>&nbsp;</span>}
        </div>

        {/* Active Line Right Indicator Badge (Absolute so it never displaces text) */}
        {isCurrentLine && (
          <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none select-none">
            <span className="bg-emerald-600 dark:bg-emerald-500 text-white dark:text-dark-950 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold shadow-sm mr-1">
              Active
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black">◄</span>
          </div>
        )}

        {/* Error icon on line */}
        {hasErrorOnLine && !isCurrentLine && (
          <div 
            className="absolute right-4 top-0 bottom-0 flex items-center text-red-500 dark:text-red-400 pointer-events-auto cursor-help" 
            title={errors.find(e => e.line === lineNum)?.message || 'Detected issue on this line'}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-xl overflow-hidden shadow-md dark:shadow-xl transition-colors">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750 select-none">
        {/* Tab with Filename */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-dark-950 text-blue-700 dark:text-brand-cyan text-xs font-mono font-medium rounded-t-md border-t-2 border-blue-600 dark:border-brand-cyan shadow-sm">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{getFileName()}</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">({lines.length} lines)</span>
        </div>

        {/* Action Buttons: Stop & Run */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-750 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              isRunning
                ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/50 hover:bg-red-100 dark:hover:bg-red-500/30 active:scale-95'
                : 'bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-dark-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>

          {/* Run Button */}
          <button
            onClick={onRun}
            className="flex items-center space-x-1 px-4 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-brand-blue dark:hover:bg-blue-500 text-white shadow-sm hover:shadow-blue-500/20 border border-blue-500 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Editor Main Body */}
      <div className="relative flex-1 flex overflow-hidden bg-white dark:bg-dark-950 font-mono transition-colors">
        {/* Line Numbers Gutter */}
        <div 
          ref={lineNumbersRef}
          style={{ paddingTop: '12px', paddingBottom: '12px' }}
          className="w-12 bg-slate-50 dark:bg-dark-900 border-r border-slate-200 dark:border-dark-750/70 select-none overflow-hidden text-right pr-3 font-mono"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = activeLine === lineNum;
            const hasError = errors.some(e => e.line === lineNum);
            return (
              <div 
                key={idx} 
                style={{ height: '24px', lineHeight: '24px', fontSize: '13px', ...FONT_STYLE }}
                className={`transition-colors ${
                  isCurrent 
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
                    : hasError 
                    ? 'text-red-500 dark:text-red-400 font-bold' 
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Code Container with Perfectly Aligned Overlay & Textarea */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Highlighted Overlay Layer */}
          <div 
            ref={overlayRef}
            style={{ 
              paddingTop: '12px', 
              paddingBottom: '12px',
              ...FONT_STYLE
            }}
            className="absolute inset-0 pointer-events-none select-none overflow-hidden whitespace-pre"
          >
            {lines.map((lineStr, idx) => renderHighlightedLine(lineStr, idx + 1))}
          </div>

          {/* Transparent Interactive Textarea Layer */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{ 
              paddingTop: '12px', 
              paddingBottom: '12px',
              paddingLeft: '16px',
              paddingRight: '16px',
              ...FONT_STYLE,
              color: 'transparent',
              caretColor: '#2563eb'
            }}
            className="relative z-10 w-full h-full bg-transparent resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-blue-500/25 selection:text-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Precise Syntax Tokenizer
// ----------------------------------------------------

function tokenizeLine(line, lang) {
  if (!line) return [{ text: '', className: '' }];

  const tokens = [];
  const regex = /(\b(?:def|class|if|elif|else|while|for|return|import|from|as|in|try|except|finally|public|static|void|int|float|double|char|bool|include|vector|string|std|cout|cin|printf|scanf|System|out|println|new|let|const|var|function)\b)|(\b\d+\b)|(["'].*?["'])|([#//].*)|([+\-*/%=!<>]+)|([a-zA-Z_]\w*)|(\s+)|(.)/g;

  let match;
  while ((match = regex.exec(line)) !== null) {
    const [full, keyword, number, str, comment, operator, identifier, whitespace, other] = match;

    if (keyword) {
      tokens.push({ text: keyword, className: 'text-purple-700 dark:text-purple-400 font-semibold' });
    } else if (number) {
      tokens.push({ text: number, className: 'text-amber-600 dark:text-amber-300 font-medium' });
    } else if (str) {
      tokens.push({ text: str, className: 'text-emerald-700 dark:text-emerald-300 font-medium' });
    } else if (comment) {
      tokens.push({ text: comment, className: 'text-slate-400 dark:text-slate-500 italic' });
    } else if (operator) {
      tokens.push({ text: operator, className: 'text-blue-600 dark:text-brand-cyan font-bold' });
    } else if (identifier) {
      tokens.push({ text: identifier, className: 'text-slate-900 dark:text-blue-200' });
    } else {
      tokens.push({ text: full, className: 'text-slate-800 dark:text-slate-300' });
    }
  }

  return tokens.length > 0 ? tokens : [{ text: line, className: 'text-slate-800 dark:text-slate-200' }];
}
