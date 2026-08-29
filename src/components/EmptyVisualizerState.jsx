import React from 'react';

export default function EmptyVisualizerState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-dark-900 transition-colors select-none">
      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm">
        {/* Ice-fishing Explorer Vector Graphic matching reference screenshot */}
        <div className="relative w-48 h-44 flex items-center justify-center">
          <svg
            viewBox="0 0 200 180"
            className="w-full h-full drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Blue Atmospheric Aura / Halo */}
            <path
              d="M95 18 C140 18, 172 45, 170 95 C168 135, 130 155, 85 152 C45 150, 25 125, 28 85 C32 45, 60 18, 95 18 Z"
              className="fill-blue-200/70 dark:fill-blue-600/25 transition-colors"
            />

            {/* Distant Cloud */}
            <path
              d="M135 52 C135 48 138 45 142 45 C144 45 146 46 147 47 C149 44 153 44 156 46 C159 44 163 46 164 49 C168 49 171 52 171 56 C171 60 167 63 162 63 L138 63 C134 63 131 60 131 56 C131 54 133 52 135 52 Z"
              className="stroke-slate-700 dark:stroke-slate-300 fill-white dark:fill-dark-800"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ice Horizon Contour Lines */}
            <path
              d="M25 110 Q80 100 175 108"
              className="stroke-slate-700 dark:stroke-slate-400"
              strokeWidth="1.5"
            />
            <path
              d="M35 125 Q100 115 178 128"
              className="stroke-slate-700 dark:stroke-slate-400"
              strokeWidth="1.5"
            />

            {/* Fishing Line & Triangle Float */}
            <path
              d="M86 92 L145 42"
              className="stroke-slate-800 dark:stroke-slate-300"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M145 42 L145 105"
              className="stroke-slate-800 dark:stroke-slate-300"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Blue Triangle Flag / Float on Fishing Line */}
            <polygon
              points="145,90 132,112 158,112"
              className="fill-blue-400 dark:fill-blue-500 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Concentric Water Ripples in Ice Hole */}
            <ellipse
              cx="145"
              cy="128"
              rx="24"
              ry="8"
              className="fill-slate-800/10 dark:fill-cyan-400/10 stroke-slate-800 dark:stroke-cyan-300"
              strokeWidth="1.5"
            />
            <ellipse
              cx="145"
              cy="128"
              rx="16"
              ry="5.5"
              className="stroke-slate-800 dark:stroke-cyan-400"
              strokeWidth="1.3"
            />
            <ellipse
              cx="145"
              cy="128"
              rx="8"
              ry="3"
              className="stroke-slate-800 dark:stroke-cyan-500 fill-slate-800 dark:fill-cyan-400"
              strokeWidth="1.2"
            />

            {/* Tackle Box / Seat */}
            <rect
              x="52"
              y="118"
              width="36"
              height="18"
              rx="3"
              className="fill-blue-100 dark:fill-dark-750 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
            />
            <line
              x1="52"
              y1="124"
              x2="88"
              y2="124"
              className="stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
            />

            {/* Fisherman Legs & Boots */}
            <path
              d="M68 116 L65 136 L76 136 L78 122"
              className="fill-blue-700 dark:fill-blue-600 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M78 116 L82 136 L94 136 L88 122"
              className="fill-blue-800 dark:fill-blue-700 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Fisherman Parka Jacket Body */}
            <path
              d="M56 86 C56 75, 88 74, 90 86 L94 118 C94 122, 54 122, 54 118 Z"
              className="fill-blue-600 dark:fill-blue-500 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Fisherman Arm holding fishing rod */}
            <path
              d="M72 90 Q82 92 88 96"
              className="stroke-slate-800 dark:stroke-slate-200 fill-none"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle
              cx="88"
              cy="96"
              r="3"
              className="fill-amber-200 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.2"
            />

            {/* Warm Winter Hat & Ear Flaps */}
            <path
              d="M62 65 C62 52, 86 52, 86 65 L86 75 C86 78, 62 78, 62 75 Z"
              className="fill-slate-600 dark:fill-slate-500 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.5"
            />
            {/* Ear flap down */}
            <path
              d="M62 68 L60 80 L66 80 L66 68 Z"
              className="fill-slate-700 dark:fill-slate-400 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.2"
            />
            <path
              d="M82 68 L84 80 L78 80 L78 68 Z"
              className="fill-slate-700 dark:fill-slate-400 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.2"
            />
            {/* Fluffy brim */}
            <rect
              x="60"
              y="62"
              width="28"
              height="6"
              rx="3"
              className="fill-slate-200 dark:fill-slate-300 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.2"
            />

            {/* Face Profile */}
            <circle
              cx="74"
              cy="72"
              r="4.5"
              className="fill-amber-100 dark:fill-amber-200 stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="1.2"
            />
            {/* Eye */}
            <circle cx="76" cy="71.5" r="0.75" className="fill-slate-900" />
          </svg>
        </div>

        {/* Clean Message Caption matching reference image */}
        <div className="text-center">
          <p className="text-xs sm:text-sm font-sans font-normal text-slate-600 dark:text-slate-400 tracking-tight">
            Run to view execution logs
          </p>
        </div>
      </div>
    </div>
  );
}
