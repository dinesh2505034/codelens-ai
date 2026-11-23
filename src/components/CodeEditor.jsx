import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
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
  theme = 'dark'
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

    // Define custom VS Code-like engineering theme matching the exact color system
    monaco.editor.defineTheme('codelens-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5F6875', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7C8BFF' },
        { token: 'string', foreground: '86E1A0' },
        { token: 'number', foreground: 'F1B56E' },
        { token: 'type', foreground: '79C0FF' },
        { token: 'function', foreground: 'D2A8FF' }
      ],
      colors: {
        'editor.background': '#12151A',
        'editor.foreground': '#E6E8EB',
        'editorGutter.background': '#12151A',
        'editorLineNumber.foreground': '#5F6875',
        'editorLineNumber.activeForeground': '#E6E8EB',
        'editor.lineHighlightBackground': '#181C22',
        'editor.selectionBackground': '#5B6CFF33',
        'editorCursor.foreground': '#5B6CFF',
        'editorOverviewRuler.border': '#232830'
      }
    });

    monaco.editor.defineTheme('codelens-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8B93A0', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4858EC' },
        { token: 'string', foreground: '16A34A' },
        { token: 'number', foreground: 'D97706' },
        { token: 'type', foreground: '0284C7' },
        { token: 'function', foreground: '7C3AED' }
      ],
      colors: {
        'editor.background': '#F7F8FA',
        'editor.foreground': '#14171C',
        'editorGutter.background': '#F7F8FA',
        'editorLineNumber.foreground': '#8B93A0',
        'editorLineNumber.activeForeground': '#14171C',
        'editor.lineHighlightBackground': '#FFFFFF',
        'editor.selectionBackground': '#5B6CFF26',
        'editorCursor.foreground': '#5B6CFF',
        'editorOverviewRuler.border': '#E3E6EB'
      }
    });

    monaco.editor.setTheme(theme === 'dark' ? 'codelens-dark' : 'codelens-light');

    updateActiveLine(activeLine, isRunning, editor, monaco);
    updateErrorMarkers(errors, editor, monaco);
  };

  // Sync theme changes with Monaco
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'codelens-dark' : 'codelens-light');
    }
  }, [theme]);

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
              color: '#5B6CFF',
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
          message: `${err.type ? `[${err.type}] ` : ''}${err.message || 'Issue detected'}`,
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

  useEffect(() => {
    updateActiveLine(activeLine, isRunning, editorRef.current, monacoRef.current);
  }, [activeLine, isRunning]);

  useEffect(() => {
    updateErrorMarkers(errors, editorRef.current, monacoRef.current);
  }, [errors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-surface)] overflow-hidden select-none">
      {/* Slim 36px File Tab Header - Flush, Engineering-Grade */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
        {/* Tab with active file */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[var(--bg-elevated)] border-r border-l first:border-l-0 border-[var(--border-color)] text-[var(--text-main)] text-xs font-mono font-medium">
            <FileCode2 className="w-3.5 h-3.5 text-[#5B6CFF]" />
            <span>{getFileName()}</span>
          </div>

          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>

          {errors.length > 0 && (
            <span className="flex items-center space-x-1 text-[11px] text-[var(--status-error)] font-mono px-1.5 py-0.2 rounded bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.length}</span>
            </span>
          )}
        </div>

        {/* Copy Button */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="relative flex-1 h-full w-full overflow-hidden">
        <Editor
          height="100%"
          language={getMonacoLang()}
          theme={theme === 'dark' ? 'codelens-dark' : 'codelens-light'}
          value={code}
          onChange={(newVal) => onChange(newVal || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
            lineHeight: 22,
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
            padding: { top: 8, bottom: 8 },
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5
            }
          }}
        />
      </div>
    </div>
  );
}
