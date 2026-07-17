/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AdPlaceholderProps {
  position: 'hero' | 'features' | 'setup' | 'victory' | 'settings' | 'reveal';
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ position }) => {
  // Define different contents for each ad placement to make them look authentic and premium
  const getAdContent = () => {
    switch (position) {
      case 'hero':
        return {
          title: '⚔️ Forge of Gods: Tactics',
          desc: 'Conquer the arena in this epic tactical strategy game. No installs required, play instantly in browser.',
          badge: 'RPG SPONSOR',
          cta: 'Play Free',
          bgColor: 'from-amber-600/10 to-red-600/10',
          borderColor: 'border-amber-500/20 hover:border-amber-500/40',
          accentColor: 'text-amber-400',
          btnBg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 hover:border-amber-400 text-amber-300',
        };
      case 'features':
        return {
          title: '🎙️ Pro Narrator Voice DLC',
          desc: 'Elevate your Mafia Party sessions with automatic high-fidelity AI narration. Let the story unfold.',
          badge: 'UPGRADE',
          cta: 'Unlock Now',
          bgColor: 'from-purple-600/10 to-indigo-600/10',
          borderColor: 'border-purple-500/20 hover:border-purple-500/40',
          accentColor: 'text-purple-400',
          btnBg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 hover:border-purple-400 text-purple-300',
        };
      case 'reveal':
        return {
          title: '🎭 Unlock Advanced AI Narrator',
          desc: 'Let AI guide your sessions with automatic voice narration and dramatic storytelling.',
          badge: 'UPGRADE',
          cta: 'Try Free',
          bgColor: 'from-pink-600/10 to-red-600/10',
          borderColor: 'border-pink-500/20 hover:border-pink-500/40',
          accentColor: 'text-pink-400',
          btnBg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/40 hover:border-pink-400 text-pink-300',
        };
      case 'setup':
        return {
          title: '🃏 Expansion Role Pack: Werewolf & Witch',
          desc: 'Add 6 more deception roles to your offline game including the Witch, Werewolf, and Cupid.',
          badge: 'EXPANSION',
          cta: 'Add $1.99',
          bgColor: 'from-blue-600/10 to-emerald-600/10',
          borderColor: 'border-blue-500/20 hover:border-blue-500/40',
          accentColor: 'text-blue-400',
          btnBg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/40 hover:border-blue-400 text-blue-300',
        };
      case 'settings':
        return {
          title: '🎨 Custom Cyber Neon Avatars',
          desc: 'Express yourself with beautiful cyberpunk skins.',
          badge: 'COSMETICS',
          cta: 'Browse',
          bgColor: 'from-cyan-600/10 to-pink-600/10',
          borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
          accentColor: 'text-cyan-400',
          btnBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 hover:border-cyan-400 text-cyan-300',
        };
      case 'victory':
      default:
        return {
          title: '🏆 Host Online Lobby: Premium Rooms',
          desc: 'Want to play with remote friends? Upgrade to premium rooms and connect instantly over WebSockets.',
          badge: 'MULTIPLAYER',
          cta: 'Host Online',
          bgColor: 'from-emerald-600/10 to-teal-600/10',
          borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
          accentColor: 'text-emerald-400',
          btnBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 hover:border-emerald-400 text-emerald-300',
        };
    }
  };

  const ad = getAdContent();

  // Desktop Left Side vertical 160x600 Ads (used for 'hero' and 'features')
  if (position === 'hero' || position === 'features') {
    return (
      <>
        {/* DESKTOP VIEW: 160x600 Sidebar Ad */}
        <div className="hidden lg:flex w-[160px] h-[600px] flex-col justify-between rounded-2xl bg-[#0A0F1D]/80 border border-slate-800 p-4 shrink-0 hover:border-slate-700 transition-all text-center select-none shadow-xl">
          <div className="space-y-4">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 font-extrabold uppercase">
              {ad.badge}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
              MP
            </div>
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight leading-snug">
              {ad.title}
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              {ad.desc}
            </p>
          </div>
          <div className="space-y-2">
            <button className={`w-full py-2.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${ad.btnBg}`}>
              {ad.cta}
            </button>
            <p className="text-[8px] font-mono text-slate-600">ADVERTISEMENT</p>
          </div>
        </div>

        {/* MOBILE VIEW: Stacks vertically as a 300x250 block */}
        <div className="lg:hidden w-full max-w-[340px] h-[250px] mx-auto flex flex-col justify-between rounded-2xl bg-[#0A0F1D]/80 border border-slate-800 p-4 hover:border-slate-700 transition-all text-center select-none shadow-lg">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 font-extrabold uppercase">
              {ad.badge}
            </span>
            <span className="text-[8px] font-mono text-slate-600 uppercase">ADVERTISEMENT</span>
          </div>
          
          <div className="flex items-center gap-3 my-2 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex items-center justify-center font-black text-white text-lg shrink-0 shadow-md">
              MP
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight">
                {ad.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium line-clamp-3">
                {ad.desc}
              </p>
            </div>
          </div>

          <button className={`w-full py-2.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${ad.btnBg}`}>
            {ad.cta}
          </button>
        </div>
      </>
    );
  }

  // Bottom Banner 728x90 (Desktop) or 320x50 (Mobile) for Setup, Victory, and Reveal screens
  if (position === 'setup' || position === 'victory' || position === 'reveal') {
    return (
      <div className="w-full max-w-2xl mx-auto my-6 select-none">
        {/* DESKTOP BANNER: 728x90 */}
        <div className="hidden sm:flex items-center justify-between bg-[#0A0F1D]/80 border border-slate-800 hover:border-slate-750 rounded-2xl p-3 px-5 transition-all shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex items-center justify-center font-black text-white text-md shrink-0 shadow-md">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono tracking-widest ${ad.accentColor} font-extrabold uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800`}>
                  {ad.badge}
                </span>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight">
                  {ad.title}
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                {ad.desc}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1.5">
            <button className={`px-4 py-2 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${ad.btnBg}`}>
              {ad.cta}
            </button>
            <span className="text-[8px] font-mono text-slate-600 uppercase">ADVERTISEMENT</span>
          </div>
        </div>

        {/* MOBILE BANNER: 320x50 */}
        <div className="sm:hidden flex items-center justify-between bg-[#0A0F1D]/85 border border-slate-800 rounded-xl p-2 px-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm">
              MP
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-tight truncate">
                {ad.title}
              </h4>
              <p className="text-[9px] text-slate-400 truncate leading-none mt-1">
                {ad.desc}
              </p>
            </div>
          </div>
          <button className={`px-2.5 py-1.5 rounded-md border text-[9px] font-extrabold uppercase transition-all cursor-pointer ml-2 ${ad.btnBg}`}>
            {ad.cta}
          </button>
        </div>
      </div>
    );
  }

  // Mini Banner 320x50 for Settings Screen bottom
  return (
    <div className="w-full max-w-xs mx-auto my-3 select-none">
      <div className="flex items-center justify-between bg-[#0A0F1D]/90 border border-slate-800 rounded-xl p-2 px-3 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex items-center justify-center font-black text-white text-xs shrink-0">
            MP
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate">
              {ad.title}
            </h4>
            <p className="text-[8px] text-slate-500 truncate mt-0.5">
              {ad.desc}
            </p>
          </div>
        </div>
        <button className={`px-2 py-1 rounded-md border text-[8px] font-extrabold uppercase transition-all cursor-pointer shrink-0 ml-2 ${ad.btnBg}`}>
          {ad.cta}
        </button>
      </div>
    </div>
  );
};
