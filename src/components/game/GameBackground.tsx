/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const GameBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#070B14] pointer-events-none select-none">
      
      {/* 🌫️ Deep atmospheric background texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-color-dodge transition-opacity duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1600&auto=format&fit=crop')`,
          filter: 'hue-rotate(-15deg) contrast(1.2)',
        }}
      />

      {/* 🔴 Blood-red ambient glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-950/20 blur-[150px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-red-900/10 blur-[180px] animate-pulse duration-[12000ms]" />
      <div className="absolute top-[40%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-blue-950/15 blur-[120px]" />

      {/* 🧥 MYSTERIOUS HOODED FIGURE (Large, highly detailed SVG Silhouette) */}
      <div className="absolute bottom-0 right-[2%] md:right-[5%] w-[320px] md:w-[450px] h-[450px] md:h-[600px] opacity-25 md:opacity-30 mix-blend-luminosity transform translate-y-4 select-none pointer-events-none transition-all duration-700">
        <svg 
          viewBox="0 0 400 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        >
          {/* Hood and Head Silhouette */}
          <path 
            d="M 120 400 C 130 250, 150 150, 170 110 C 180 90, 190 70, 205 70 C 220 70, 230 90, 240 110 C 260 150, 280 250, 290 400 Z" 
            fill="url(#hoodGradient)" 
          />
          <path 
            d="M 170 110 C 175 140, 185 165, 205 165 C 225 165, 235 140, 240 110 C 230 112, 215 115, 205 115 C 195 115, 180 112, 170 110 Z" 
            fill="#05080E" 
          />
          
          {/* Shadow of the cloak and shoulders */}
          <path 
            d="M 40 500 C 60 450, 100 405, 130 395 C 150 405, 180 410, 205 410 C 230 410, 260 405, 280 395 C 310 405, 350 450, 370 500 Z" 
            fill="url(#cloakGradient)" 
          />

          {/* Ominous glowing red eyes deep inside the hood */}
          <ellipse cx="193" cy="126" rx="4.5" ry="1.5" fill="#EF4444" className="animate-pulse" style={{ animationDuration: '3s' }} />
          <ellipse cx="217" cy="126" rx="4.5" ry="1.5" fill="#EF4444" className="animate-pulse" style={{ animationDuration: '3s' }} />
          <path d="M 190 120 L 198 123" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 220 120 L 212 123" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />

          {/* Raised Arm holding a gleaming knife */}
          <path 
            d="M 110 420 C 95 380, 80 310, 85 270 C 88 250, 95 240, 105 242 C 115 244, 118 255, 122 275 C 130 315, 138 375, 132 420 Z" 
            fill="url(#armGradient)" 
          />
          
          {/* Hand holding the dagger */}
          <circle cx="103" cy="242" r="10" fill="#0D1527" stroke="#1E293B" strokeWidth="1.5" />
          
          {/* 🗡️ Gleaming Dagger / Knife */}
          {/* Handle */}
          <rect x="99" y="215" width="8" height="20" rx="2" transform="rotate(-15, 103, 225)" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          {/* Crossguard */}
          <rect x="91" y="213" width="24" height="4" rx="1" transform="rotate(-15, 103, 215)" fill="#475569" />
          
          {/* Gleaming Razor Blade */}
          <path 
            d="M 100 212 L 80 120 C 80 120, 92 105, 96 90 C 100 115, 114 175, 106 210 Z" 
            fill="url(#bladeGradient)" 
            stroke="#94A3B8" 
            strokeWidth="1" 
            strokeLinejoin="round"
          />
          
          {/* Gleam Sparkle on the knife tip */}
          <path 
            d="M 96 90 L 96 75 M 96 90 L 96 105 M 96 90 L 81 90 M 96 90 L 111 90" 
            stroke="#FCA5A5" 
            strokeWidth="1.5" 
            className="animate-ping" 
            style={{ animationDuration: '2s', transformOrigin: '96px 90px' }} 
          />
          <path 
            d="M 96 90 L 96 80 M 96 90 L 96 100 M 96 90 L 86 90 M 96 90 L 106 90" 
            stroke="#FFFFFF" 
            strokeWidth="2" 
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="hoodGradient" x1="205" y1="70" x2="205" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B1120" />
              <stop offset="60%" stopColor="#060914" />
              <stop offset="100%" stopColor="#04060C" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="cloakGradient" x1="205" y1="395" x2="205" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#080C16" />
              <stop offset="100%" stopColor="#070B14" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="armGradient" x1="110" y1="242" x2="110" y2="420" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B1222" />
              <stop offset="100%" stopColor="#070B14" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="bladeGradient" x1="96" y1="90" x2="100" y2="212" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 🩸 DRIFTING & SPATTERED VECTOR BLOOD SPLATTERS (Strategically placed around boundaries) */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40">
        <svg viewBox="0 0 1000 1000" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Left Corner heavy blood spray & drips */}
          <g transform="translate(-10, -10)">
            <path 
              d="M 0 0 L 180 0 C 170 30, 150 40, 130 50 C 120 70, 115 110, 105 115 C 95 120, 85 90, 75 130 C 70 150, 50 210, 45 250 C 42 270, 35 270, 35 240 C 35 200, 25 180, 20 150 C 15 130, 5 90, 0 80 Z" 
              fill="url(#bloodGradDark)" 
            />
            {/* Hanging Blood Drips */}
            <path d="M 45 248 C 45 285, 41 295, 43 295 C 45 295, 47 285, 47 248 Z" fill="#7F1D1D" />
            <path d="M 75 128 C 74 175, 71 185, 72.5 185 C 74 185, 76 175, 76 128 Z" fill="#991B1B" />
            <path d="M 105 112 C 104 220, 101 230, 102.5 230 C 104 230, 106 220, 106 112 Z" fill="#7F1D1D" className="animate-pulse" style={{ animationDuration: '4s' }} />
            
            {/* Floating splat droplets nearby */}
            <circle cx="160" cy="90" r="4" fill="#991B1B" />
            <circle cx="120" cy="160" r="3" fill="#7F1D1D" />
            <circle cx="65" cy="220" r="5" fill="#B91C1C" />
            <circle cx="190" cy="40" r="2.5" fill="#B91C1C" />
            <circle cx="103" cy="240" r="3.5" fill="#7F1D1D" />
          </g>

          {/* Top Right dripping edge */}
          <g transform="translate(850, -5)">
            <path 
              d="M 150 0 L 0 0 C 10 25, 20 35, 30 50 C 35 65, 45 65, 50 90 C 55 110, 70 140, 72 170 C 73 185, 78 185, 77 160 C 75 120, 95 100, 110 80 C 120 70, 140 40, 150 30 Z" 
              fill="url(#bloodGradDark)" 
            />
            <path d="M 72 168 C 72 210, 69 220, 70.5 220 C 72 220, 73.5 210, 73.5 168 Z" fill="#7F1D1D" />
            <circle cx="35" cy="110" r="3" fill="#991B1B" />
            <circle cx="115" cy="130" r="4.5" fill="#7F1D1D" />
            <circle cx="71" cy="232" r="2.5" fill="#EF4444" />
          </g>

          {/* Bottom Left ground splash/splatter */}
          <g transform="translate(30, 850)">
            <path 
              d="M 0 150 C 20 130, 40 125, 60 135 C 80 145, 95 110, 110 115 C 130 120, 150 140, 170 150 Z" 
              fill="url(#bloodGradDark)" 
              className="opacity-80"
            />
            {/* Splash drops exploding upward */}
            <path d="M 60 135 C 55 105, 52 100, 53.5 100 C 55 100, 58 105, 58 135 Z" fill="#991B1B" />
            <path d="M 110 115 C 115 75, 118 70, 116.5 70 C 115 70, 112 75, 112 115 Z" fill="#7F1D1D" />
            <circle cx="53.5" cy="90" r="3" fill="#B91C1C" />
            <circle cx="116.5" cy="58" r="4" fill="#991B1B" />
            <circle cx="150" cy="85" r="2.5" fill="#7F1D1D" />
            <circle cx="25" cy="105" r="3.5" fill="#991B1B" />
          </g>

          {/* Large ominous central-right spray splatter (behind cards) */}
          <g transform="translate(680, 420)" className="opacity-70">
            <path 
              d="M 50 50 Q 30 10, 10 30 Q -10 50, 15 75 Q 40 100, 75 75 Q 110 50, 80 20 Q 50 -10, 50 50 Z" 
              fill="#7F1D1D" 
            />
            {/* Fine droplets radiating outward representing high-velocity impact */}
            <circle cx="-15" cy="15" r="3" fill="#7F1D1D" />
            <circle cx="-35" cy="-10" r="2" fill="#991B1B" />
            <circle cx="10" cy="-30" r="4" fill="#7F1D1D" />
            <circle cx="60" cy="-45" r="2.5" fill="#991B1B" />
            <circle cx="115" cy="-15" r="3" fill="#7F1D1D" />
            <circle cx="135" cy="35" r="1.5" fill="#EF4444" />
            <circle cx="110" cy="100" r="5" fill="#7F1D1D" />
            <circle cx="45" cy="125" r="3" fill="#991B1B" />
            <circle cx="-25" cy="95" r="2" fill="#B91C1C" />
          </g>

          {/* Define Red Gradients */}
          <defs>
            <linearGradient id="bloodGradDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#450A0A" />
              <stop offset="70%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 🌫️ Floating Fog / Mist Layers (animated for parallax mystery) */}
      <div className="absolute inset-0 pointer-events-none select-none mix-blend-screen opacity-10">
        <div className="absolute top-[20%] left-[-20%] w-[140%] h-[40%] bg-gradient-to-r from-transparent via-slate-600 to-transparent blur-[80px] animate-[fogMove_25s_infinite_linear]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[130%] h-[35%] bg-gradient-to-r from-transparent via-red-950 to-transparent blur-[100px] animate-[fogMoveRev_35s_infinite_linear]" />
      </div>

      {/* 🎚️ Global Vignette Overlay to guarantee high contrast and text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/90 via-[#070B14]/40 to-[#070B14]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#070B14_90%)] pointer-events-none" />

      {/* Inject custom CSS keyframes for background animations */}
      <style>{`
        @keyframes fogMove {
          0% { transform: translateX(-15%) translateY(0) rotate(0deg); }
          50% { transform: translateX(10%) translateY(5%) rotate(2deg); }
          100% { transform: translateX(-15%) translateY(0) rotate(0deg); }
        }
        @keyframes fogMoveRev {
          0% { transform: translateX(10%) translateY(0) rotate(0deg); }
          50% { transform: translateX(-15%) translateY(-5%) rotate(-2deg); }
          100% { transform: translateX(10%) translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};
