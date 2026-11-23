import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  HardDrive, 
  Layers,
  Copy,
  Check,
  Code
} from 'lucide-react';
import MathText from './MathText';

export default function DeepExplanationModal({
  isOpen,
  onClose,
  analysisData,
  isLoading,
  language = 'python'
}) {
  const [perspective, setPerspective] = useState('eli5');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!analysisData) return;
    const text = `# ${analysisData.title}\n\n${analysisData.summary}\n\nTime Complexity: ${analysisData.complexity?.time}\nSpace Complexity: ${analysisData.complexity?.space}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-fadeIn select-none">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[12px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-modal overflow-hidden transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Code Analysis & Complexity
            </h2>
            <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-muted)]">
              {language}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text font-sans text-xs">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#5B6CFF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Analyzing syntax tree, algorithmic complexity, and execution semantics...
              </p>
            </div>
          ) : analysisData ? (
            <>
              {/* Algorithm Title & Summary */}
              <div className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 rounded-[8px] space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    {analysisData.title}
                  </h3>
                  {analysisData.algorithmType && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                      {analysisData.algorithmType}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-main)] leading-relaxed">
                  <MathText text={analysisData.summary} />
                </div>
                {analysisData.tags && analysisData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisData.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-app)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Time & Space Complexity Cards - Neutral surfaces with accent only on value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Time Complexity Card */}
                <div className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 rounded-[8px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time Complexity</span>
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#5B6CFF]">
                      <MathText text={analysisData.complexity?.time || 'O(N)'} />
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    <MathText text={analysisData.complexity?.timeDetail || 'Linear execution time.'} />
                  </div>
                </div>

                {/* Space Complexity Card */}
                <div className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 rounded-[8px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center space-x-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Space Complexity</span>
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#5B6CFF]">
                      <MathText text={analysisData.complexity?.space || 'O(1)'} />
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    <MathText text={analysisData.complexity?.spaceDetail || 'Constant memory utilization.'} />
                  </div>
                </div>
              </div>

              {/* Perspectives: ELI5 vs Senior Engineer */}
              <div className="border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-[8px] p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                    Explanation Perspective
                  </span>

                  {/* Neutral Segmented Switcher */}
                  <div className="flex items-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)] p-0.5">
                    <button
                      onClick={() => setPerspective('eli5')}
                      className={`px-2.5 py-0.5 text-xs rounded-[4px] cursor-pointer ${
                        perspective === 'eli5'
                          ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      Conceptual (ELI5)
                    </button>
                    <button
                      onClick={() => setPerspective('senior')}
                      className={`px-2.5 py-0.5 text-xs rounded-[4px] cursor-pointer ${
                        perspective === 'senior'
                          ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      Senior Engineer
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[var(--text-main)] leading-relaxed pt-1">
                  <MathText 
                    text={perspective === 'eli5'
                      ? analysisData.perspectives?.eli5
                      : analysisData.perspectives?.senior} 
                  />
                </div>
              </div>

              {/* Line-by-Line Breakdown Table */}
              {analysisData.lineByLine && analysisData.lineByLine.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Line-by-Line Breakdown</span>
                  </span>

                  <div className="border border-[var(--border-color)] rounded-[8px] overflow-hidden bg-[var(--bg-surface)]">
                    <div className="divide-y divide-[var(--border-color)] max-h-60 overflow-y-auto">
                      {analysisData.lineByLine.map((item, idx) => (
                        <div key={idx} className="p-2.5 hover:bg-[var(--bg-elevated)] transition-colors flex items-start space-x-3 text-xs">
                          <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-app)] px-1.5 py-0.5 rounded border border-[var(--border-color)] flex-shrink-0">
                            L{item.line}
                          </span>
                          <div className="flex-1 space-y-0.5">
                            {item.code && (
                              <div className="font-mono text-[11px] text-[var(--text-main)] truncate opacity-90">
                                {item.code}
                              </div>
                            )}
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              <MathText text={item.explanation} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-[var(--text-muted)] italic">
              No analysis data available. Click "Deep AI Explain" to generate.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
