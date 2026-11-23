import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Check, 
  RefreshCw,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { uploadImageForOCR } from '../services/api';

export default function ImageUploadModal({
  isOpen,
  onClose,
  onImportCode,
  apiKey = ''
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedCode, setExtractedCode] = useState('');
  const [detectedLang, setDetectedLang] = useState('python');
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedCode('');
    setConfidence(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessOCR = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await uploadImageForOCR(selectedFile, apiKey);
      if (res && res.code) {
        setExtractedCode(res.code);
        setDetectedLang(res.language || 'python');
        setConfidence(res.confidence || 0.85);
      } else {
        throw new Error('No code could be recognized in the image.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to extract code from image. Please ensure text is legible.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (extractedCode.trim()) {
      onImportCode(extractedCode, detectedLang);
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedCode('');
    setConfidence(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-fadeIn select-none">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-[12px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-modal overflow-hidden transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-[#5B6CFF]" />
            <h2 className="text-sm font-semibold text-[var(--text-main)]">
              Image to Code (OCR)
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
        <div className="p-5 space-y-4 overflow-y-auto font-sans text-xs">
          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#5B6CFF] bg-[#5B6CFF]/5'
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)] bg-[var(--bg-surface)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center mb-2.5 text-[var(--text-muted)] shadow-subtle">
                <UploadCloud className="w-5 h-5 text-[#5B6CFF]" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--text-main)]">
                Click to upload or drag & drop code screenshot
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Supports PNG, JPG, WebP up to 10MB
              </p>
            </div>
          ) : (
            /* Preview & Result Section */
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Uploaded Image Preview */}
                <div className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>Source Screenshot</span>
                    <button
                      onClick={handleReset}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline cursor-pointer"
                    >
                      Change image
                    </button>
                  </div>
                  <div className="max-h-52 overflow-hidden rounded-[6px] border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-app)]">
                    <img
                      src={previewUrl}
                      alt="Uploaded code"
                      className="object-contain max-h-52 w-auto"
                    />
                  </div>
                </div>

                {/* Extracted Code Area */}
                <div className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-2">
                      <span className="flex items-center space-x-1">
                        <FileCode className="w-3.5 h-3.5 text-[#5B6CFF]" />
                        <span>Extracted Code</span>
                      </span>
                      {detectedLang && (
                        <span className="uppercase">{detectedLang}</span>
                      )}
                    </div>

                    {isProcessing ? (
                      <div className="h-44 flex flex-col items-center justify-center space-y-2 text-[var(--text-muted)]">
                        <div className="w-5 h-5 border-2 border-[#5B6CFF] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Extracting source characters...</span>
                      </div>
                    ) : extractedCode ? (
                      <textarea
                        value={extractedCode}
                        onChange={(e) => setExtractedCode(e.target.value)}
                        rows={8}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[6px] p-2.5 font-mono text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[#5B6CFF] resize-none"
                      />
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center space-y-2 text-[var(--text-muted)] italic">
                        <span>Click "Extract Code" below to run OCR recognition</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-[6px] border border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error)] text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-main)] hover:bg-[var(--accent-subtle)] cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            {selectedFile && !extractedCode && (
              <button
                onClick={handleProcessOCR}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#5B6CFF] hover:bg-[#4858EC] text-white shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Extract Code</span>
                )}
              </button>
            )}

            {extractedCode && (
              <button
                onClick={handleImport}
                className="px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#5B6CFF] hover:bg-[#4858EC] text-white shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Import to Editor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
