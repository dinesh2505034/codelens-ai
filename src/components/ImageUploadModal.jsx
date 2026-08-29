import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Sparkles, 
  FileText, 
  Check, 
  RefreshCw,
  Image as ImageIcon,
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
  const [notes, setNotes] = useState('');
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
        setNotes(res.notes || 'Code successfully extracted via OCR.');
      } else {
        throw new Error('No code could be recognized in the image.');
      }
    } catch (err) {
      console.error('OCR processing failed:', err);
      setErrorMsg(err.message || 'Failed to extract code from image. Please ensure the code is clearly visible.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-brand-cyan/20 text-blue-600 dark:text-brand-cyan shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Image to Code OCR Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract live source code from screenshots and photos using OCR + AI Vision
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-brand-cyan/10'
                  : 'border-slate-300 dark:border-dark-750 hover:border-slate-400 bg-slate-50 dark:bg-dark-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="p-4 rounded-full bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-700 mb-3 text-blue-600 dark:text-brand-cyan shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop code image
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPG, JPEG, WebP screenshots from IDEs, terminals, or textbooks
              </p>
            </div>
          ) : (
            /* Preview & Result Section */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Image Preview */}
                <div className="space-y-2 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-brand-cyan" />
                      <span>Uploaded Image</span>
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-xs text-red-500 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change Image</span>
                    </button>
                  </div>
                  <div className="relative rounded-xl border border-slate-200 dark:border-dark-750 overflow-hidden bg-slate-100 dark:bg-dark-950 h-64 flex items-center justify-center p-2">
                    <img
                      src={previewUrl}
                      alt="Code Screenshot"
                      className="max-h-full w-auto object-contain rounded-lg shadow-xs"
                    />
                  </div>
                </div>

                {/* Right: Extracted Code Area */}
                <div className="space-y-2 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-emerald" />
                      <span>Extracted Source Code</span>
                    </span>
                    {extractedCode && (
                      <div className="flex items-center space-x-1">
                        <select
                          value={detectedLang}
                          onChange={(e) => setDetectedLang(e.target.value)}
                          className="text-[10px] font-mono bg-blue-100 dark:bg-dark-800 text-blue-800 dark:text-brand-cyan px-1.5 py-0.5 rounded border border-blue-200 dark:border-dark-700 font-bold focus:outline-none"
                        >
                          <option value="python">PYTHON</option>
                          <option value="cpp">C++</option>
                          <option value="c">C</option>
                          <option value="java">JAVA</option>
                        </select>
                        {confidence && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            {Math.round(confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-dark-750 bg-slate-50 dark:bg-dark-950 h-64 overflow-hidden flex flex-col">
                    {isProcessing ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3 p-4">
                        <div className="w-8 h-8 border-3 border-blue-600 dark:border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Scanning pixels & extracting syntax via OCR...
                        </p>
                      </div>
                    ) : extractedCode ? (
                      <textarea
                        value={extractedCode}
                        onChange={(e) => setExtractedCode(e.target.value)}
                        placeholder="Extracted code will appear here..."
                        spellCheck={false}
                        className="w-full h-full p-3 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 resize-none focus:outline-none overflow-auto leading-5"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400 text-center p-4">
                        <Sparkles className="w-6 h-6 text-slate-400" />
                        <span className="text-xs">Click "Extract Code with OCR" below to process image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500 font-sans">
                  {notes || 'You can edit the extracted code above before importing.'}
                </div>

                <div className="flex items-center space-x-2">
                  {!extractedCode ? (
                    <button
                      onClick={handleProcessOCR}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>{isProcessing ? 'Extracting...' : 'Extract Code with OCR'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleImport}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Import into Code Editor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
