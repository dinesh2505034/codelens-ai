import React, { useState } from 'react';
import { X, Share2, Copy, Check, Link, Globe, Download, Sparkles } from 'lucide-react';
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
    a.download = `codelens-${language}-explanation.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-brand-emerald/20 text-emerald-600 dark:text-brand-emerald shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Share Code & Visual State
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a shareable link or export interactive session
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
        <div className="p-6 space-y-4 font-sans select-text">
          {!shareUrl ? (
            <div className="text-center py-6 space-y-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 w-16 h-16 mx-auto flex items-center justify-center text-blue-600 dark:text-brand-cyan">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ready to generate a unique share link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Anyone with this link can view the animated step visualizer, memory state diagram, and AI explanation.
                </p>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{isGenerating ? 'Generating Link...' : 'Create Shareable Link'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Link className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan" />
                  <span>Shareable Web Link</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-dark-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Offline JSON Export:</span>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-dark-850 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
