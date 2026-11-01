import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Square, 
  Copy, 
  Check, 
  FileCode2, 
  AlertCircle
} from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  language = 'python',
  activeLine = 1,
  isRunning = false,
  onRun,
  onStop,
  errors = [],
  theme = 'light'
}) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const lines = (code || '').split('\n');

  const getFileName = () => {
    switch (language) {
      case 'cpp': return 'main.cpp';
      case 'c': return 'main.c';
      case 'java': return 'Main.java';
      default: return 'main.py';
    }
  };

  const getMonacoLang = () => {
    switch (language) {
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      default: return 'python';
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Apply initial decorations and markers
    updateActiveLine(activeLine, isRunning, editor, monaco);
    updateErrorMarkers(errors, editor, monaco);
  };

  const updateActiveLine = (line, running, editor, monaco) => {
    if (!editor || !monaco) return;

    if (running && line && line > 0) {
      const newDecorations = [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-active-line-bg',
            glyphMarginClassName: 'monaco-active-glyph',
            overviewRuler: {
              color: '#10b981',
              position: monaco.editor.OverviewRulerLane.Full
            }
          }
        }
      ];
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
      editor.revealLineInCenterIfOutsideViewport(line);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  };

  const updateErrorMarkers = (errList, editor, monaco) => {
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    if (errList && errList.length > 0) {
      const markers = errList.map(err => {
        const line = Math.max(1, Math.min(err.line || 1, model.getLineCount()));
        const col = Math.max(1, err.column || 1);
        const lineLen = model.getLineLength(line) || 10;
        return {
          startLineNumber: line,
          startColumn: col,
          endLineNumber: line,
          endColumn: lineLen + 1,
          message: `${err.type ? `[${err.type}] ` : ''}${err.message || 'Compiler issue detected'}`,
          severity: err.severity?.toLowerCase().includes('warning') 
            ? monaco.MarkerSeverity.Warning 
            : monaco.MarkerSeverity.Error
        };
      });
      monaco.editor.setModelMarkers(model, 'compiler', markers);
    } else {
      monaco.editor.setModelMarkers(model, 'compiler', []);
    }
  };

  // Sync active line whenever step changes
  useEffect(() => {
    updateActiveLine(activeLine, isRunning, editorRef.current, monacoRef.current);
  }, [activeLine, isRunning]);

  // Sync compiler error markers whenever error diagnostics change
  useEffect(() => {
    updateErrorMarkers(errors, editorRef.current, monacoRef.current);
  }, [errors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          {errors.length > 0 && (
            <span className="flex items-center space-x-1 text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800/40">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.length} {errors.length === 1 ? 'issue' : 'issues'}</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Copy, Stop, Run */}
        <div className="flex items-center space-x-2">
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

      {/* Editor Body with Monaco */}
      <div className="relative flex-1 h-full overflow-hidden">
        <Editor
          height="100%"
          language={getMonacoLang()}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          value={code}
          onChange={(newVal) => onChange(newVal || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            lineHeight: 24,
            tabSize: 4,
            insertSpaces: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            glyphMargin: true,
            renderLineHighlight: 'all',
            minimap: { enabled: false },
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            wordWrap: 'on',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            }
          }}
        />
      </div>
    </div>
  );
}
