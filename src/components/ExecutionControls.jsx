import React from 'react';
import { 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  Gauge
} from 'lucide-react';

export default function ExecutionControls({
  currentStep = 1,
  totalSteps = 1,
  isPlaying = false,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onRewind,
  onFastForward,
  onSeekStep,
  playbackSpeed = 1,
  onChangeSpeed,
  activeTab = 'visualizer',
  setActiveTab
}) {
  const tabs = [
    { id: 'visualizer', label: 'Visualizer' },
    { id: 'variables', label: 'Variables' },
    { id: 'output', label: 'Output' }
  ];

  const speeds = [0.5, 1, 2];

  const handleCycleSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onChangeSpeed(speeds[nextIndex]);
  };

  return (
    <div className="h-9 px-3 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between select-none">
      {/* Tab-style Panel Header ('Visualizer', 'Variables', 'Output') */}
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab && setActiveTab(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-[6px] transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] font-medium shadow-subtle border border-[var(--border-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent-subtle)] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Compact Icon-Only Step Controls & Slider */}
      <div className="flex items-center space-x-2">
        {/* Segmented Stepper Buttons */}
        <div className="flex items-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5 shadow-subtle">
          {/* Rewind */}
          <button
            onClick={onRewind}
            disabled={currentStep <= 1}
            className={`p-1 rounded-[4px] cursor-pointer ${
              currentStep > 1 
                ? 'text-[var(--text-main)] hover:bg-[var(--accent-subtle)]' 
                : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
            }`}
            title="Rewind to start"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Step Backward */}
          <button
            onClick={onStepBackward}
            disabled={currentStep <= 1}
            className={`p-1 rounded-[4px] cursor-pointer ${
              currentStep > 1 
                ? 'text-[var(--text-main)] hover:bg-[var(--accent-subtle)]' 
                : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
            }`}
            title="Step backward (Left Arrow)"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className="p-1 rounded-[4px] text-[#5B6CFF] hover:bg-[#5B6CFF]/10 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Auto Play'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            className={`p-1 rounded-[4px] cursor-pointer ${
              currentStep < totalSteps 
                ? 'text-[var(--text-main)] hover:bg-[var(--accent-subtle)]' 
                : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
            }`}
            title="Step forward (Right Arrow)"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

        {/* Minimal Compact Slider + Step Counter */}
        <div className="hidden sm:flex items-center space-x-2 pl-1 font-mono text-[11px] text-[var(--text-muted)]">
          <input
            type="range"
            min="1"
            max={totalSteps || 1}
            value={currentStep}
            onChange={(e) => onSeekStep(parseInt(e.target.value, 10))}
            className="w-16 md:w-24 h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[#5B6CFF]"
            title={`Step ${currentStep} of ${totalSteps}`}
          />
          <span className="min-w-[48px] text-right font-medium text-[var(--text-main)]">
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* Speed Cycle Button */}
        <button
          onClick={handleCycleSpeed}
          className="px-1.5 py-0.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11px] font-mono font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer shadow-subtle"
          title="Cycle playback speed"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}
