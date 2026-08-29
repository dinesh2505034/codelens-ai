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
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));
  const handleZoomReset = () => setZoomLevel(100);

  const varEntries = Object.entries(variables || {});

  return (
    <div className="relative flex-1 flex flex-col p-4 bg-white dark:bg-dark-900 overflow-hidden select-none min-h-[220px] transition-colors">
      {/* Zoomable Container */}
      <div 
        className="flex-1 flex flex-col items-center justify-center overflow-auto p-2 transition-transform duration-200"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
      >
        {/* Main Stack Block Frame (matching reference screenshot dotted box) */}
        <div className="w-full max-w-md border border-dashed border-slate-300 dark:border-slate-600/80 rounded-xl p-4 bg-slate-50 dark:bg-dark-950/60 shadow-sm dark:shadow-lg relative">
          {/* Block Header */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-dark-800 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                {callStack && callStack.length > 0 ? callStack[callStack.length - 1].frameName : 'Main Block'}
              </span>
            </div>
            {callStack && callStack.length > 1 && (
              <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">
                Stack Depth: {callStack.length}
              </span>
            )}
          </div>

          {/* Variables Section */}
          <div className="mb-2">
            <div className="flex items-center space-x-1 mb-2">
              <Database className="w-3 h-3 text-blue-600 dark:text-brand-cyan" />
              <span className="text-xs font-mono font-semibold text-blue-700 dark:text-brand-cyan">Variables</span>
            </div>

            {varEntries.length > 0 ? (
              /* Variable Table matching reference screenshot */
              <div className="w-full border border-slate-200 dark:border-dark-750 rounded-lg overflow-hidden bg-white dark:bg-dark-900/90 shadow-inner">
                <table className="w-full text-left font-mono text-xs">
                  <tbody>
                    {varEntries.map(([name, val]) => {
                      const isChanged = changedVar === name;
                      const formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);

                      return (
                        <tr 
                          key={name}
                          className={`border-b border-slate-100 dark:border-dark-800/80 last:border-b-0 transition-all duration-300 ${
                            isChanged 
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-bold' 
                              : 'hover:bg-slate-50 dark:hover:bg-dark-850/60'
                          }`}
                        >
                          {/* Variable Name */}
                          <td className="px-3.5 py-2 font-semibold text-blue-700 dark:text-blue-300 border-r border-slate-100 dark:border-dark-800/80 w-1/2">
                            <span className="flex items-center space-x-1.5">
                              {isChanged && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                              <span>{name}</span>
                            </span>
                          </td>

                          {/* Variable Value */}
                          <td className={`px-3.5 py-2 font-medium ${isChanged ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                            {formattedVal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-xs font-mono text-slate-400 dark:text-slate-500 italic">
                No local variables in current scope.
              </div>
            )}
          </div>

          {/* Array / Collection Data Structure Visualizer */}
          {dataStructures && dataStructures.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-dark-800">
              {dataStructures.map((ds, dsIdx) => (
                <div key={dsIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-blue-700 dark:text-brand-cyan font-bold flex items-center space-x-1">
                      <Box className="w-3 h-3" />
                      <span>{ds.name} (Array [{ds.items ? ds.items.length : 0}])</span>
                    </span>
                  </div>

                  {/* Array Blocks with Indices */}
                  <div className="flex flex-wrap items-center gap-1.5 py-1">
                    {ds.items && ds.items.map((item, idx) => {
                      const isActive = ds.activeIndices && ds.activeIndices.includes(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          {/* Index Badge */}
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-0.5">[{idx}]</span>
                          
                          {/* Box Value */}
                          <div 
                            className={`w-9 h-9 rounded-md border flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 shadow-sm ${
                              isActive
                                ? 'bg-blue-100 dark:bg-brand-blue/30 border-blue-500 dark:border-brand-cyan text-blue-800 dark:text-brand-cyan scale-105 shadow-xs'
                                : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {item}
                          </div>

                          {/* Pointer Label */}
                          {ds.pointers && (
                            <div className="mt-0.5 text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                              {Object.entries(ds.pointers)
                                .filter(([k, v]) => v === idx)
                                .map(([k]) => `▲ ${k}`)
                                .join(' ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-white/95 dark:bg-dark-950/90 border border-slate-200 dark:border-dark-750 rounded-lg px-2 py-1 shadow-sm text-xs font-mono">
        <button
          onClick={handleZoomOut}
          className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-brand-cyan font-bold transition-colors cursor-pointer"
          title="Reset Zoom (100%)"
        >
          {zoomLevel}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
