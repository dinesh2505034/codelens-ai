import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Copy, 
  Check, 
  FileCode2, 
  Sparkles,
  AlertCircle,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';

const FONT_STYLE = {
  fontFamily: '"Fira Code", monospace',
  fontSize: '14px',
  lineHeight: '24px',
  letterSpacing: '0px',
  tabSize: 4
};

export default function CodeEditor({
  code,
  onChange,
  language = 'python',
  activeLine = 1,
  isRunning = false,
  onRun,
  onStop,
  errors = [],
  customInputs = '',
  onChangeCustomInputs
}) {
  const [copied, setCopied] = useState(false);
  const [showStdin, setShowStdin] = useState(true); // Open by default for easy access
  const overlayRef = useRef(null);
  const textareaRef = useRef(null);

  const lines = code.split('\n');

  // Detect if code requests stdin (e.g. input(), cin >>, scanf, Scanner)
  const hasInputStatement = /input\s*\(|cin\s*>>|scanf\s*\(|Scanner\b|sys\.stdin/i.test(code);

  // Auto-open stdin drawer if input statement is detected
  useEffect(() => {
    if (hasInputStatement) {
      setShowStdin(true);
    }
  }, [hasInputStatement]);

  // Synchronize textarea scroll with syntax highlighter overlay
  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileName = () => {
    switch (language) {
      case 'cpp': return 'main.cpp';
      case 'c': return 'main.c';
      case 'java': return 'Main.java';
      default: return 'main.py';
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

        {/* Active Line Right Indicator Badge */}
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

        {/* Action Buttons: Stdin Toggle, Copy, Stop, Run */}
        <div className="flex items-center space-x-2">
          {/* Custom Input Toggle Button */}
          <button
            type="button"
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showStdin 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border-blue-300 dark:border-cyan-500/40' 
                : 'bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-750'
            }`}
            title="Toggle Custom Input (stdin)"
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Stdin</span>
            {hasInputStatement && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping ml-0.5"></span>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-750 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {isRunning ? (
            <button
              onClick={onStop}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onRun}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 dark:bg-brand-blue dark:hover:bg-blue-600 text-white shadow-xs hover:shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Number Gutter */}
        <div 
          style={{ paddingTop: '12px', paddingBottom: '12px' }}
          className="w-12 bg-slate-50/80 dark:bg-dark-950/60 border-r border-slate-200/80 dark:border-dark-800 text-right pr-3 select-none flex flex-col pointer-events-none"
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

      {/* Prominent Custom Input (stdin) Panel */}
      {showStdin && (
        <div className="border-t border-slate-200 dark:border-dark-750 bg-slate-50 dark:bg-dark-850 p-3 select-none flex flex-col space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-blue-600 dark:text-brand-cyan" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Custom User Input (stdin)
              </span>
              {hasInputStatement && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  Input Required
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowStdin(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Hide
            </button>
          </div>

          <textarea
            value={customInputs}
            onChange={(e) => onChangeCustomInputs && onChangeCustomInputs(e.target.value)}
            placeholder="Type your inputs here (one value per line for each input(), cin, or scanf call)..."
            rows={2}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-300 dark:border-dark-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-5 select-text shadow-inner"
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Values are automatically passed into <code className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.2 rounded text-[10px]">input()</code>, <code className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.2 rounded text-[10px]">cin &gt;&gt;</code>, or <code className="font-mono bg-slate-200 dark:bg-dark-800 px-1 py-0.2 rounded text-[10px]">Scanner</code> when you click <strong>Run</strong>.
          </p>
        </div>
      )}
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
