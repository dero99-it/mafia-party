/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Player, RoleType } from '../../types';
import { translations } from '../../utils/translations';
import { sfx } from '../../utils/audio';
import { motion } from 'motion/react';
import { Skull, Shield, Search, Users, Scale, ArrowRight, ArrowLeft } from 'lucide-react';
import { AdPlaceholder } from '../ads/AdPlaceholder';

interface RevealPhaseScreenProps {
  eliminatedPlayer: Player | null;
  onContinue: () => void;
  language: 'en' | 'ar';
}

export const RevealPhaseScreen: React.FC<RevealPhaseScreenProps> = ({
  eliminatedPlayer,
  onContinue,
  language
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    if (eliminatedPlayer) {
      if (eliminatedPlayer.role.type === RoleType.MAFIA) {
        sfx.playMafiaDeath(); // Play optimistic/triumphant rise
      } else {
        sfx.playCitizenDeath(); // Play mournful sad minor progression
      }
    }
  }, [eliminatedPlayer]);

  // Determine header, subtext, icon, and colors depending on role
  let roleTitle = '';
  let roleDesc = '';
  let iconElement = <Users className="w-20 h-20" />;
  let cardBgClass = 'from-blue-600/20 to-blue-950/40 border-blue-500/30';
  let badgeColorClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  let badgeText = '';

  if (!eliminatedPlayer) {
    roleTitle = t.tieTitle;
    roleDesc = t.tieDesc;
    iconElement = <Scale className="w-20 h-20 text-slate-400" />;
    cardBgClass = 'from-slate-800/40 to-slate-950/40 border-slate-700/30';
    badgeColorClass = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    badgeText = language === 'ar' ? 'تعادل' : 'TIE';
  } else {
    const roleType = eliminatedPlayer.role.type;
    const name = eliminatedPlayer.name;

    if (roleType === RoleType.MAFIA) {
      roleTitle = language === 'ar' 
        ? `🎭 تم كشف الدور! ${name} كان... 🔪 مافيا!`
        : `🎭 Role Revealed! ${name} was... 🔪 MAFIA!`;
      roleDesc = t.mafiaEliminatedDesc;
      iconElement = <Skull className="w-24 h-24 text-red-500 animate-pulse" />;
      cardBgClass = 'from-red-600/30 to-red-950/50 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
      badgeColorClass = 'bg-red-500/10 border-red-500/20 text-red-400';
      badgeText = language === 'ar' ? 'مافيا' : 'MAFIA';
    } else if (roleType === RoleType.CITIZEN) {
      roleTitle = language === 'ar'
        ? `🎭 تم كشف الدور! ${name} كان... 👤 مواطن`
        : `🎭 Role Revealed! ${name} was... 👤 CITIZEN`;
      roleDesc = t.citizenEliminatedDesc;
      iconElement = <Users className="w-24 h-24 text-blue-500" />;
      cardBgClass = 'from-blue-600/20 to-blue-950/40 border-blue-500/30';
      badgeColorClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      badgeText = language === 'ar' ? 'مواطن' : 'CITIZEN';
    } else if (roleType === RoleType.DOCTOR) {
      roleTitle = language === 'ar'
        ? `🎭 تم كشف الدور! ${name} كان... 🩺 طبيب`
        : `🎭 Role Revealed! ${name} was... 🩺 DOCTOR`;
      roleDesc = t.doctorEliminatedDesc;
      iconElement = <Shield className="w-24 h-24 text-emerald-500" />;
      cardBgClass = 'from-emerald-600/20 to-emerald-950/40 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]';
      badgeColorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      badgeText = language === 'ar' ? 'طبيب' : 'DOCTOR';
    } else if (roleType === RoleType.DETECTIVE) {
      roleTitle = language === 'ar'
        ? `🎭 تم كشف الدور! ${name} كان... 🕵️ محقق`
        : `🎭 Role Revealed! ${name} was... 🕵️ DETECTIVE`;
      roleDesc = t.detectiveEliminatedDesc;
      iconElement = <Search className="w-24 h-24 text-amber-500" />;
      cardBgClass = 'from-amber-600/20 to-amber-950/40 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]';
      badgeColorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      badgeText = language === 'ar' ? 'محقق' : 'DETECTIVE';
    }
  }

  return (
    <div 
      className="w-full max-w-2xl mx-auto px-4 py-8 text-slate-100 font-sans flex flex-col justify-between min-h-[75vh]"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <div className="space-y-6 text-center my-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
            {t.roleRevealPhaseTitle}
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight max-w-xl mx-auto text-white">
            {roleTitle}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {roleDesc}
          </p>
        </motion.div>

        {/* Revealed Character Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={`w-[290px] h-[390px] mx-auto bg-gradient-to-br ${cardBgClass} rounded-[32px] border p-6 shadow-2xl flex flex-col justify-between items-center relative overflow-hidden group`}
        >
          {/* Badge */}
          <div className="w-full flex justify-between items-center">
            <span className={`px-2.5 py-0.5 border text-[9px] font-extrabold rounded-full tracking-wider uppercase ${badgeColorClass}`}>
              {badgeText}
            </span>
            <span className="text-slate-600 text-xs font-mono">
              {eliminatedPlayer ? `#0${eliminatedPlayer.index + 1}` : '⚖️'}
            </span>
          </div>

          {/* Icon Stage */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 my-2">
            <motion.div 
              animate={eliminatedPlayer?.role.type === RoleType.MAFIA ? {
                scale: [1, 1.05, 1],
                rotate: [0, -2, 2, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-4 bg-slate-950/60 rounded-full border border-slate-800/80 shadow-inner flex items-center justify-center w-36 h-36"
            >
              {iconElement}
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                {eliminatedPlayer ? eliminatedPlayer.name : (language === 'ar' ? 'سلام عادل' : 'TIE')}
              </h3>
              <p className="text-slate-500 text-[11px] font-mono mt-1">
                {eliminatedPlayer 
                  ? (language === 'ar' ? eliminatedPlayer.role.name : eliminatedPlayer.role.name) 
                  : (language === 'ar' ? 'انتهت بالتعادل' : 'No Banishment')
                }
              </p>
            </div>
          </div>

          <div className="w-full text-center text-[10px] text-slate-500 font-mono">
            {eliminatedPlayer ? (language === 'ar' ? 'تم إقصاؤه بالتصويت' : 'VOTED OUT') : ''}
          </div>
        </motion.div>
      </div>

      <div className="my-4">
        <AdPlaceholder position="reveal" />
      </div>

      {/* Continuation button */}
      <div className="text-center">
        <button
          onClick={() => {
            sfx.playClick();
            onContinue();
          }}
          className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t.continueToNextNight}</span>
          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
