import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import ExecutionControls from './components/ExecutionControls';
import OutputTerminal from './components/OutputTerminal';
import VisualStateMemory from './components/VisualStateMemory';
import StepExplanationCard from './components/StepExplanationCard';
import EmptyVisualizerState from './components/EmptyVisualizerState';
import StatusBar from './components/StatusBar';
import DeepExplanationModal from './components/DeepExplanationModal';
import DebuggerPanel from './components/DebuggerPanel';
import ImageUploadModal from './components/ImageUploadModal';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';
import { SAMPLE_PRESETS } from './data/samplePresets';
import { 
  fetchStepTrace, 
  fetchDeepExplanation, 
  fetchDebugAnalysis, 
  getSharedSession 
} from './services/api';

export default function App() {
  const defaultPreset = SAMPLE_PRESETS[0];

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultPreset.code);
  const [activePreset, setActivePreset] = useState(defaultPreset.id);
  const [customInputs, setCustomInputs] = useState('');

  // Theme state: support dark / light with persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codelens_theme') || 
           localStorage.getItem('omnicode_theme') || 
           'dark';
  });

  // Step Execution & Trace state
  const [hasExecuted, setHasExecuted] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  // Tab & Divider state for flush panels
  const [activeRightTab, setActiveRightTab] = useState('visualizer');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // AI Modal states
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const [isOCROpen, setIsOCROpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const playTimerRef = useRef(null);
  const debugTimerRef = useRef(null);

  // Apply Theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('codelens_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Draggable divider mouse listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.max(25, Math.min(75, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // Load shared session or query params if present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    const urlLang = params.get('lang');
    const urlCode = params.get('code');

    if (sessionId) {
      getSharedSession(sessionId).then((session) => {
        if (session) {
          setCode(session.code);
          setLanguage(session.language);
          if (session.explanation) setAnalysisData(session.explanation);
          if (session.trace) {
            setTraceData(session.trace);
            setHasExecuted(true);
          }
        }
      }).catch(console.error);
    } else if (urlCode) {
      try {
        setCode(decodeURIComponent(urlCode));
        if (urlLang) setLanguage(urlLang);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Compute Step Trace
  const runExecutionTrace = useCallback(async (codeToRun = code, langToRun = language, inputsToRun = customInputs, startStep = 0) => {
    setIsRunning(true);
    try {
      const trace = await fetchStepTrace(codeToRun, langToRun, inputsToRun);
      setTraceData(trace);
      const steps = trace.steps || [];
      if (steps.length > 0) {
        setCurrentStepIndex(Math.max(0, Math.min(startStep, steps.length - 1)));
      }
    } catch (err) {
      console.error('Failed to run trace:', err);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, customInputs]);

  // Initial background debug check
  useEffect(() => {
    runBackgroundDebugCheck(code, language);
  }, []);

  // Background static debug checker
  const runBackgroundDebugCheck = async (c, l) => {
    try {
      const res = await fetchDebugAnalysis(c, l);
      setDebugData(res);
    } catch (err) {
      console.warn('Debug check failed:', err);
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (presetId) => {
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(preset.id);
      setLanguage(preset.language);
      setCode(preset.code);
      setHasExecuted(false);
      setIsPlaying(false);
      setCustomInputs('');
      runBackgroundDebugCheck(preset.code, preset.language);
    }
  };

  // Handle Code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setActivePreset('');
    setHasExecuted(false);
    setIsPlaying(false);
    setCustomInputs('');

    if (debugTimerRef.current) clearTimeout(debugTimerRef.current);
    debugTimerRef.current = setTimeout(() => {
      runBackgroundDebugCheck(newCode, language);
    }, 450);
  };

  // Handle Language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setHasExecuted(false);
    setIsPlaying(false);
    setCustomInputs('');
    const matched = SAMPLE_PRESETS.find(p => p.language === newLang);
    if (matched) {
      setActivePreset(matched.id);
      setCode(matched.code);
      runBackgroundDebugCheck(matched.code, newLang);
    }
  };

  // Current Step Item
  const steps = traceData?.steps || [];
  const totalSteps = steps.length || 1;
  const currentStep = steps[currentStepIndex] || {
    line: 1,
    lineCode: '',
    callStack: [{ frameName: 'Main Block', line: 1 }],
    variables: {},
    changedVar: null,
    dataStructures: null,
    output: '',
    explanation: 'Ready to execute.',
    statusText: 'Ready'
  };

  // Auto-play interval timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(200, 1500 / playbackSpeed);
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalSteps, playbackSpeed]);

  // Stepper Handlers
  const handleTogglePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRewind = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCustomInputs('');
    runExecutionTrace(code, language, '', 0);
  };

  const handleFastForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  const handleSeekStep = (stepNum) => {
    setIsPlaying(false);
    const targetIdx = Math.max(0, Math.min(stepNum - 1, totalSteps - 1));
    setCurrentStepIndex(targetIdx);
  };

  // Explicit Run Handler
  const handleRun = useCallback(async () => {
    setHasExecuted(true);
    setCustomInputs('');
    setIsPlaying(true);
    setActiveRightTab('visualizer');
    await runExecutionTrace(code, language, '', 0);
  }, [runExecutionTrace, code, language]);

  // Global Ctrl + Enter / Cmd + Enter Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  const handleInteractiveSubmit = (inputVal) => {
    const updatedInputs = customInputs ? `${customInputs}\n${inputVal}` : inputVal;
    setCustomInputs(updatedInputs);
    runExecutionTrace(code, language, updatedInputs, currentStepIndex);
  };

  const handleStop = () => {
    setHasExecuted(false);
    setIsPlaying(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setCustomInputs('');
  };

  // Deep AI Explanation Trigger
  const handleOpenDeepExplain = async () => {
    setIsExplainOpen(true);
    setIsAnalyzing(true);
    try {
      const res = await fetchDeepExplanation(code, language);
      setAnalysisData(res);
    } catch (err) {
      console.error('Explanation request error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Debugger Trigger
  const handleOpenDebugger = async () => {
    setIsDebuggerOpen(true);
    setIsDebugging(true);
    try {
      const res = await fetchDebugAnalysis(code, language);
      setDebugData(res);
    } catch (err) {
      console.error('Debug analysis error:', err);
    } finally {
      setIsDebugging(false);
    }
  };

  // Apply Debugger 1-Click Fix
  const handleApplyFix = (fixedCode) => {
    setCode(fixedCode);
    setIsDebuggerOpen(false);
    setHasExecuted(false);
    runBackgroundDebugCheck(fixedCode, language);
  };

  // Handle OCR Imported Code
  const handleImportOCRCode = (newCode, detectedLang) => {
    setCode(newCode);
    if (detectedLang) setLanguage(detectedLang);
    setHasExecuted(false);
    runBackgroundDebugCheck(newCode, detectedLang || language);
  };

  const lineCount = code ? code.split('\n').length : 1;
  const executionStatus = isRunning 
    ? 'Running' 
    : hasExecuted 
      ? (currentStep.hasError ? 'Error' : 'Done') 
      : 'Ready';

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-150">
      {/* 1. Header Toolbar (48px) */}
      <Navbar
        language={language}
        setLanguage={handleLanguageChange}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        presets={SAMPLE_PRESETS}
        onOpenOCR={() => setIsOCROpen(true)}
        onOpenExplain={handleOpenDeepExplain}
        onOpenDebugger={handleOpenDebugger}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasErrors={debugData && debugData.issues && debugData.issues.length > 0}
        issueCount={debugData?.issues?.length || 0}
        onRunCode={handleRun}
        onResetCode={handleRewind}
        isRunning={hasExecuted && (isPlaying || isRunning)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Flush Split Main Panels */}
      <main ref={containerRef} className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Pane: Code Editor */}
        <section 
          style={{ width: `${splitRatio}%` }}
          className="h-full flex flex-col min-w-[280px] overflow-hidden max-lg:!w-full max-lg:h-1/2"
        >
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            language={language}
            activeLine={hasExecuted ? currentStep.line : null}
            isRunning={hasExecuted}
            onRun={handleRun}
            onStop={handleStop}
            errors={debugData?.issues || []}
            theme={theme}
          />
        </section>

        {/* Draggable 1px Divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={() => setIsDragging(true)}
          className={`hidden lg:flex w-[1px] relative cursor-col-resize group select-none transition-colors ${
            isDragging ? 'bg-[#5B6CFF]' : 'bg-[var(--border-color)] hover:bg-[#5B6CFF]'
          }`}
          title="Drag to resize panels"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 z-20 cursor-col-resize" />
        </div>

        {/* Right Pane: Visualizer & Output */}
        <section 
          style={{ width: `${100 - splitRatio}%` }}
          className="h-full flex flex-col min-w-[300px] overflow-hidden max-lg:!w-full max-lg:h-1/2 max-lg:border-t border-[var(--border-color)] bg-[var(--bg-surface)]"
        >
          {hasExecuted ? (
            <>
              {/* Header with Execution Controls & Tabs */}
              <ExecutionControls
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onStepForward={handleStepForward}
                onStepBackward={handleStepBackward}
                onRewind={handleRewind}
                onFastForward={handleFastForward}
                onSeekStep={handleSeekStep}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                activeTab={activeRightTab}
                setActiveTab={setActiveRightTab}
              />

              {/* Tab 1: Visualizer (Visual Memory + Step Explanation + Output preview) */}
              {activeRightTab === 'visualizer' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--bg-surface)]">
                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                    <VisualStateMemory
                      variables={currentStep.variables}
                      changedVar={currentStep.changedVar}
                      callStack={currentStep.callStack}
                      dataStructures={currentStep.dataStructures}
                    />
                    <StepExplanationCard
                      activeLine={currentStep.line}
                      lineCode={currentStep.lineCode}
                      explanation={currentStep.explanation}
                      statusText={currentStep.statusText}
                      currentStep={currentStepIndex + 1}
                      totalSteps={totalSteps}
                      hasError={currentStep.hasError}
                      errorDiagnostic={currentStep.errorDiagnostic || null}
                    />
                  </div>
                  {(currentStep.output || currentStep.isWaitingForInput || traceData?.isWaitingForInput) && (
                    <div className="h-44 border-t border-[var(--border-color)] flex flex-col shrink-0">
                      <OutputTerminal 
                        output={currentStep.output}
                        isWaitingForInput={currentStep.isWaitingForInput || traceData?.isWaitingForInput}
                        inputPrompt={currentStep.inputPrompt || traceData?.inputPrompt || '>'}
                        onSubmitInput={handleInteractiveSubmit}
                        executionTime={traceData?.executionTime || '0.015s'}
                        exitCode={traceData?.exitCode || 0}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Variables Only */}
              {activeRightTab === 'variables' && (
                <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg-surface)]">
                  <VisualStateMemory
                    variables={currentStep.variables}
                    changedVar={currentStep.changedVar}
                    callStack={currentStep.callStack}
                    dataStructures={currentStep.dataStructures}
                  />
                </div>
              )}

              {/* Tab 3: Output Terminal Only */}
              {activeRightTab === 'output' && (
                <div className="flex-1 min-h-0 flex flex-col bg-[var(--bg-surface)]">
                  <OutputTerminal 
                    output={currentStep.output}
                    isWaitingForInput={currentStep.isWaitingForInput || traceData?.isWaitingForInput}
                    inputPrompt={currentStep.inputPrompt || traceData?.inputPrompt || '>'}
                    onSubmitInput={handleInteractiveSubmit}
                    executionTime={traceData?.executionTime || '0.015s'}
                    exitCode={traceData?.exitCode || 0}
                  />
                </div>
              )}
            </>
          ) : (
            /* Clean Idle State */
            <div className="flex flex-col h-full bg-[var(--bg-surface)]">
              <div className="h-9 px-3 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between select-none">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
                  Output & Visualizer
                </span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setIsShareOpen(true)} 
                    className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer" 
                    title="Share Code"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <EmptyVisualizerState />
            </div>
          )}
        </section>
      </main>

      {/* 3. Bottom Status Bar (24px) */}
      <StatusBar
        language={language}
        lineCount={lineCount}
        status={executionStatus}
        executionTime={traceData?.executionTime || '-'}
        currentStep={hasExecuted ? currentStepIndex + 1 : null}
        totalSteps={hasExecuted ? totalSteps : null}
        hasError={hasExecuted && Boolean(currentStep.hasError || currentStep.errorDiagnostic)}
      />

      {/* Modals & Dialogs */}
      <DeepExplanationModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        analysisData={analysisData}
        isLoading={isAnalyzing}
        language={language}
      />

      <DebuggerPanel
        isOpen={isDebuggerOpen}
        onClose={() => setIsDebuggerOpen(false)}
        debugData={debugData}
        isLoading={isDebugging}
        onApplyFix={handleApplyFix}
        currentCode={code}
      />

      <ImageUploadModal
        isOpen={isOCROpen}
        onClose={() => setIsOCROpen(false)}
        onImportCode={handleImportOCRCode}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        code={code}
        language={language}
        traceData={traceData}
        analysisData={analysisData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
