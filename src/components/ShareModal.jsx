import React, { useState } from 'react';
import { X, Share2, Copy, Check, Link, Download } from 'lucide-react';
import { createShareLink } from '../services/api';

export default function ShareModal({
  isOpen,
  onClose,
  code,
  language,
  traceData,
  analysisData
}) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        code,
        language,
        title: analysisData?.title || `${language.toUpperCase()} Code Explanation`,
        trace: traceData,
        explanation: analysisData
      };
      const res = await createShareLink(payload);
      const fullUrl = `${window.location.origin}/?session=${res.id}`;
      setShareUrl(fullUrl);
    } catch (err) {
      const encoded = encodeURIComponent(code);
      const hashUrl = `${window.location.origin}/?lang=${language}&code=${encoded}`;
      setShareUrl(hashUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      code,
      language,
      analysis: analysisData,
      trace: traceData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelens-${language}-trace.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-fadeIn select-none">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[12px] w-full max-w-lg shadow-modal overflow-hidden transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#5B6CFF]" />
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Share Session
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
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Generate an immutable public link to share this code, compiler outputs, and synchronized execution trace.
          </p>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full py-2 px-3 bg-[#5B6CFF] hover:bg-[#4858EC] text-white rounded-[6px] font-medium text-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 shadow-xs"
            >
              <Link className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating Public Link...' : 'Create Shareable Link'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[6px] px-2.5 py-1.5 font-mono text-xs text-[var(--text-main)] focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#5B6CFF] hover:bg-[#4858EC] text-white font-medium rounded-[6px] text-xs flex items-center space-x-1 cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Export JSON option */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">Export raw execution data:</span>
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--accent-subtle)] text-[var(--text-main)] text-xs font-medium cursor-pointer"
            >
              <Download className="w-3 h-3 text-[var(--text-muted)]" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
