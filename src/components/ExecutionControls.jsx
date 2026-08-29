import React from 'react';
import { 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Share2, 
  Gauge 
} from 'lucide-react';

export default function ExecutionControls({
  currentStep,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onRewind,
  onFastForward,
  onSeekStep,
  playbackSpeed,
  onChangeSpeed,
  onOpenShare
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-dark-750 select-none transition-colors">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Output & Visualizer
        </span>
      </div>

      {/* Stepper Controls */}
      <div className="flex items-center space-x-2">
        {/* Rewind / Step Back Button */}
        <button
          onClick={onStepBackward}
          disabled={currentStep <= 1}
          className={`p-1.5 rounded-md border transition-all cursor-pointer ${
            currentStep > 1
              ? 'bg-white dark:bg-dark-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-750 hover:text-slate-900 dark:hover:text-white shadow-xs'
              : 'bg-slate-100 dark:bg-dark-950/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-dark-800 cursor-not-allowed'
          }`}
          title="Step Backward"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={onTogglePlay}
          className={`p-1.5 rounded-md border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-500/50 hover:bg-amber-100 dark:hover:bg-amber-500/30'
              : 'bg-blue-50 dark:bg-brand-blue/20 text-blue-600 dark:text-brand-cyan border-blue-200 dark:border-brand-cyan/40 hover:bg-blue-100 dark:hover:bg-brand-blue/30'
          }`}
          title={isPlaying ? 'Pause Animation' : 'Auto Play Execution'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        {/* Step Scrubber & "Step X of Y" Badge */}
        <div className="flex items-center space-x-2 bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-750 px-2.5 py-1 rounded-lg shadow-xs">
          <input
            type="range"
            min="1"
            max={totalSteps || 1}
            value={currentStep}
            onChange={(e) => onSeekStep(parseInt(e.target.value, 10))}
            className="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-brand-cyan"
          />
          <span className="text-xs font-mono font-semibold text-blue-700 dark:text-brand-cyan whitespace-nowrap min-w-[75px] text-center">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Step Forward / Fast Forward Button */}
        <button
          onClick={onStepForward}
          disabled={currentStep >= totalSteps}
          className={`p-1.5 rounded-md border transition-all cursor-pointer ${
            currentStep < totalSteps
              ? 'bg-blue-600 dark:bg-brand-blue text-white border-blue-500 dark:border-blue-400/40 hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-95 shadow-sm'
              : 'bg-slate-100 dark:bg-dark-950/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-dark-800 cursor-not-allowed'
          }`}
          title="Step Forward"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Playback Speed Selector */}
        <div className="hidden sm:flex items-center bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-750 rounded-lg px-2 py-0.5 text-xs shadow-xs">
          <Gauge className="w-3 h-3 text-slate-500 mr-1" />
          <select
            value={playbackSpeed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="bg-transparent text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="0.5" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200">0.5x</option>
            <option value="1" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200">1.0x</option>
            <option value="2" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200">2.0x</option>
            <option value="4" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200">4.0x</option>
          </select>
        </div>

        {/* Share Icon */}
        <button
          onClick={onOpenShare}
          className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors cursor-pointer"
          title="Share this visual state"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
