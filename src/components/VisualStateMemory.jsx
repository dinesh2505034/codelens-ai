import React, { useState } from 'react';
import { Layers, Database, ZoomIn, ZoomOut, RotateCcw, Box } from 'lucide-react';

export default function VisualStateMemory({
  variables = {},
  changedVar = null,
  callStack = [],
  dataStructures = null
}) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 80));
  const handleZoomReset = () => setZoomLevel(100);

  const varEntries = Object.entries(variables || {});

  const inferType = (val) => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'string') return 'str';
    if (Array.isArray(val)) return `list[${val.length}]`;
    if (typeof val === 'object' && val !== null) return 'object';
    return typeof val;
  };

  return (
    <div className="flex-1 flex flex-col p-3 bg-[var(--bg-surface)] overflow-y-auto select-none">
      {/* Zoom Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
            Memory & State
          </span>
          {callStack && callStack.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              Stack: {callStack[callStack.length - 1].frameName || 'main'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-1.5 py-0.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            title="Reset zoom"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Container with Zoom Transform */}
      <div 
        className="flex-1 space-y-3 transition-transform duration-150 origin-top"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        {/* Call Stack Frame Container */}
        {callStack && callStack.length > 1 && (
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-[var(--text-muted)]">
              <span className="flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-[#5B6CFF]" />
                <span>Call Stack ({callStack.length} frames)</span>
              </span>
            </div>
            <div className="space-y-1">
              {callStack.map((frame, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between px-2 py-1 rounded-[4px] text-xs font-mono border ${
                    idx === callStack.length - 1
                      ? 'border-[#5B6CFF]/40 bg-[#5B6CFF]/10 text-[var(--text-main)] font-medium'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  <span>{frame.frameName}</span>
                  <span className="text-[10px] opacity-75">line {frame.line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Bordered Table for Variables (Zebra-free rows) */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
              Variables in Scope
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {varEntries.length} {varEntries.length === 1 ? 'var' : 'vars'}
            </span>
          </div>

          {varEntries.length > 0 ? (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-surface)]/40">
                  <th className="px-3 py-1.5 font-medium w-1/3">Name</th>
                  <th className="px-3 py-1.5 font-medium w-1/2">Value</th>
                  <th className="px-3 py-1.5 font-medium text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {varEntries.map(([name, val]) => {
                  const isChanged = changedVar === name;
                  const formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                  const typeLabel = inferType(val);

                  return (
                    <tr 
                      key={name}
                      className={`transition-colors ${
                        isChanged 
                          ? 'bg-[#5B6CFF]/10 text-[var(--text-main)]' 
                          : 'bg-transparent text-[var(--text-main)] hover:bg-[var(--accent-subtle)]'
                      }`}
                    >
                      {/* Name Column */}
                      <td className="px-3 py-2 font-medium">
                        <div className="flex items-center space-x-1.5">
                          {isChanged && <span className="w-1.5 h-1.5 rounded-full bg-[#5B6CFF]" />}
                          <span className={isChanged ? 'text-[#5B6CFF] font-semibold' : ''}>{name}</span>
                        </div>
                      </td>

                      {/* Value Column */}
                      <td className="px-3 py-2 font-mono break-all">
                        <span className={isChanged ? 'font-semibold' : ''}>
                          {formattedVal}
                        </span>
                      </td>

                      {/* Type Column */}
                      <td className="px-3 py-2 text-right text-[11px] text-[var(--text-muted)]">
                        {typeLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-xs font-mono text-[var(--text-muted)] italic">
              No local variables in current scope.
            </div>
          )}
        </div>

        {/* Arrays & Structures Visualizer */}
        {dataStructures && dataStructures.length > 0 && (
          <div className="space-y-2">
            {dataStructures.map((ds, dsIdx) => (
              <div key={dsIdx} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-main)] font-medium flex items-center space-x-1">
                    <Box className="w-3.5 h-3.5 text-[#5B6CFF]" />
                    <span>{ds.name}</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    length: {ds.items ? ds.items.length : 0}
                  </span>
                </div>

                {ds.items && ds.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 font-mono text-xs">
                    {ds.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        className="flex flex-col items-center border border-[var(--border-color)] rounded-[4px] bg-[var(--bg-surface)] px-2 py-1 min-w-[32px]"
                      >
                        <span className="text-[9px] text-[var(--text-muted)]">[{itemIdx}]</span>
                        <span className="font-semibold text-[var(--text-main)]">{String(item)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
