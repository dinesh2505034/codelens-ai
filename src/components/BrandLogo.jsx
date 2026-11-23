import React from 'react';

export default function BrandLogo({ 
  size = 24, 
  showText = true, 
  className = '',
  textClassName = ''
}) {
  return (
    <div className={`flex items-center space-x-2 select-none ${className}`}>
      {/* Precision Vector Icon matching user brand image */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-[var(--text-main)]"
      >
        {/* Top-Right Scanning Beam / Antenna */}
        <line 
          x1="58" 
          y1="39" 
          x2="72" 
          y2="25" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* Top Cyan Signal Dash */}
        <rect 
          x="75" 
          y="22" 
          width="10" 
          height="5.5" 
          rx="2.75" 
          fill="#38BDF8" 
        />

        {/* Bottom Cyan Signal Dash */}
        <rect 
          x="71" 
          y="34" 
          width="15" 
          height="6" 
          rx="3" 
          fill="#38BDF8" 
        />

        {/* Handle Shadow for Depth */}
        <line 
          x1="62" 
          y1="67" 
          x2="80" 
          y2="85" 
          stroke="rgba(0,0,0,0.2)" 
          strokeWidth="11" 
          strokeLinecap="round" 
        />

        {/* Main Lens Handle */}
        <line 
          x1="60" 
          y1="65" 
          x2="78" 
          y2="83" 
          stroke="currentColor" 
          strokeWidth="9" 
          strokeLinecap="round" 
        />

        {/* Outer White / Contrast Lens Ring */}
        <circle 
          cx="42" 
          cy="52" 
          r="21" 
          stroke="currentColor" 
          strokeWidth="7" 
        />

        {/* Inner Cyan / Blue Focal Iris */}
        <circle 
          cx="42" 
          cy="52" 
          r="10.5" 
          stroke="#38BDF8" 
          strokeWidth="6" 
          fill="none" 
        />
      </svg>

      {/* Brand Text: Codelens AI */}
      {showText && (
        <span className={`font-semibold tracking-tight text-[var(--text-main)] ${textClassName || 'text-sm'}`}>
          Codelens <span className="text-[#38BDF8]">AI</span>
        </span>
      )}
    </div>
  );
}
