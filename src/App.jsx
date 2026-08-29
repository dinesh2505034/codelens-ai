import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Share2 } from 'lucide-react';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import ExecutionControls from './components/ExecutionControls';
import OutputTerminal from './components/OutputTerminal';
import VisualStateMemory from './components/VisualStateMemory';
import StepExplanationCard from './components/StepExplanationCard';
import EmptyVisualizerState from './components/EmptyVisualizerState';
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

  // Theme state: Default to 'light' with toggle support
  const [theme, setTheme] = useState(() => localStorage.getItem('omnicode_theme') || 'light');

  // Step Execution & Trace state
  const [hasExecuted, setHasExecuted] = useState(false); // Only start execution when user presses Run!
  const [traceData, setTraceData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

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

  // Apply Theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('omnicode_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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

  // Initial background debug check only (does NOT execute code on mount)
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
    runBackgroundDebugCheck(newCode, language);
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

  // Explicit Run Handler: Execution ONLY starts when user clicks Run!
  const handleRun = async () => {
    setHasExecuted(true);
    setCustomInputs('');
    setIsPlaying(true);
    await runExecutionTrace(code, language, '', 0);
  };

  const handleCustomInputChange = (newInputs) => {
    setCustomInputs(newInputs);
  };

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

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        language={language}
        setLanguage={handleLanguageChange}
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

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 overflow-hidden">
        {/* Left Pane: Code Editor */}
        <section className="h-full overflow-hidden flex flex-col">
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            language={language}
            activeLine={hasExecuted ? currentStep.line : null}
            isRunning={hasExecuted && (isPlaying || isRunning)}
            onRun={handleRun}
            onStop={handleStop}
            errors={debugData?.issues || []}
          />
        </section>

        {/* Right Pane: Visualizer & Output */}
        <section className="h-full flex flex-col bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-xl overflow-hidden shadow-md dark:shadow-xl transition-colors">
          {hasExecuted ? (
            <>
              {/* 1. Header with Execution Playback Controls */}
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
                onOpenShare={() => setIsShareOpen(true)}
              />

              {/* 2. Output Terminal Box */}
              <OutputTerminal 
                output={currentStep.output}
                isWaitingForInput={currentStep.isWaitingForInput || traceData?.isWaitingForInput}
                inputPrompt={currentStep.inputPrompt || traceData?.inputPrompt || '>'}
                onSubmitInput={handleInteractiveSubmit}
                executionTime={traceData?.executionTime || '0.015s'}
                exitCode={traceData?.exitCode || 0}
              />

              {/* 3. Visual State & Memory Box */}
              <VisualStateMemory
                variables={currentStep.variables}
                changedVar={currentStep.changedVar}
                callStack={currentStep.callStack}
                dataStructures={currentStep.dataStructures}
              />

              {/* 4. Explanation Card */}
              <StepExplanationCard
                activeLine={currentStep.line}
                lineCode={currentStep.lineCode}
                explanation={currentStep.explanation}
                statusText={currentStep.statusText}
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                hasError={currentStep.hasError}
              />
            </>
          ) : (
            /* Clean Idle State matching reference screenshot */
            <div className="flex flex-col h-full bg-white dark:bg-dark-900 transition-colors">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750 select-none">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide font-sans">
                  Output & Visualizer
                </span>
                <div className="flex items-center space-x-2 text-slate-400">
                  <button 
                    onClick={() => setIsShareOpen(true)} 
                    className="p-1 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer" 
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <EmptyVisualizerState />
            </div>
          )}
        </section>
      </main>

      {/* Modals & Drawers */}
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
