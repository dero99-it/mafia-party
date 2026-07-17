/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../../types';
import { sfx } from '../../utils/audio';
import { translations, getLocalizedRoleDetails } from '../../utils/translations';
import { Skull, Shield, Search, Users, AlertTriangle, Eye, Fingerprint } from 'lucide-react';

interface RevealScreenProps {
  players: Player[];
  onFinishReveal: () => void;
  language: 'en' | 'ar';
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ 
  players, 
  onFinishReveal,
  language
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [step, setStep] = useState<'TRANSFER' | 'PRIVACY' | 'SHOW_ROLE' | 'LOCK_DOWN'>('TRANSFER');
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100 for visual progress ring
  const [isPressing, setIsPressing] = useState(false);

  const activePlayer = players[currentPlayerIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  // Localized Role details
  const localizedRole = getLocalizedRoleDetails(activePlayer.role.type, language);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    timerRef.current = null;
    progressIntervalRef.current = null;
  };

  const handleImReady = () => {
    sfx.playClick();
    setStep('PRIVACY');
  };

  // Long press handlers to prevent peeking
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clearTimers();
    sfx.playClick();
    setIsPressing(true);
    setPressProgress(0);

    const duration = 1000; // 1 second
    const stepTime = 20; // tick every 20ms
    let currentMs = 0;

    progressIntervalRef.current = setInterval(() => {
      currentMs += stepTime;
      const progress = Math.min((currentMs / duration) * 100, 100);
      setPressProgress(progress);

      if (progress >= 100) {
        clearTimers();
        setIsPressing(false);
        sfx.playRevealSting();
        setStep('SHOW_ROLE');
      }
    }, stepTime);
  };

  const handlePressEnd = () => {
    clearTimers();
    setIsPressing(false);
    setPressProgress(0);
  };

  const handleSeenRole = () => {
    sfx.playClick();
    if (currentPlayerIndex < players.length - 1) {
      setStep('LOCK_DOWN');
    } else {
      // All players have seen their roles
      onFinishReveal();
    }
  };

  const handleNextPlayerTransfer = () => {
    sfx.playClick();
    setCurrentPlayerIndex(prev => prev + 1);
    setStep('TRANSFER');
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'MAFIA':
        return <Skull className="w-16 h-16 text-red-500 animate-pulse" />;
      case 'DOCTOR':
        return <Shield className="w-16 h-16 text-emerald-500 animate-pulse" />;
      case 'DETECTIVE':
        return <Search className="w-16 h-16 text-amber-500 animate-pulse" />;
      default:
        return <Users className="w-16 h-16 text-blue-500 animate-pulse" />;
    }
  };

  return (
    <div 
      className="w-full max-w-md mx-auto px-4 py-8 text-slate-100 font-sans min-h-[500px] flex flex-col justify-between fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* 1. Step: TRANSFER PHONE */}
      {step === 'TRANSFER' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-md">
              <Users className="w-10 h-10" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">{t.passThePhone.replace(' to', '')}</p>
            <h2 className="text-3xl font-black text-white font-display">
              {isRtl ? `أعطِ الهاتف إلى ${activePlayer.name}` : `Pass to ${activePlayer.name}`}
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
              {isRtl 
                ? `يرجى تسليم الجهاز سراً إلى اللاعب ${activePlayer.name}. تأكد ألا ينظر أحد غيره للشاشة!`
                : `Please hand the device to ${activePlayer.name}. Nobody else should look at the screen!`}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleImReady}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-base cursor-pointer"
            >
              {isRtl ? `أنا ${activePlayer.name}، أنا جاهز` : `I am ${activePlayer.name}, I'm Ready ➔`}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              {isRtl 
                ? `اللاعب ${currentPlayerIndex + 1} من أصل ${players.length}`
                : `Player ${currentPlayerIndex + 1} of ${players.length}`}
            </p>
          </div>
        </div>
      )}

      {/* 2. Step: PRIVACY WARNING & LONG PRESS */}
      {step === 'PRIVACY' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 animate-bounce shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-amber-500 font-bold">{language === 'ar' ? 'شاشة حماية الخصوصية' : 'Privacy Screen'}</p>
            <h2 className="text-2xl font-black text-white font-display">{t.makeSureNobodyLooking}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
              {isRtl
                ? 'قم بتغطية شاشتك بيدك، أو أبعدها عن الآخرين قبل الضغط لكشف هويتك السرية.'
                : 'Hold the screen with your hand or turn away from others before revealing your identity.'}
            </p>
          </div>

          {/* Interactive Long Press Button */}
          <div className="my-10 flex flex-col items-center justify-center">
            <div 
              role="button"
              tabIndex={0}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center cursor-pointer select-none border border-slate-800 bg-[#0A0F1D] active:scale-95 transition-all shadow-2xl"
            >
              {/* SVG Circular Progress Ring */}
              <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  className="stroke-slate-950"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  className="stroke-blue-500 transition-all duration-75"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 72}`}
                  strokeDashoffset={`${2 * Math.PI * 72 * (1 - pressProgress / 100)}`}
                />
              </svg>

              <div className="z-10 flex flex-col items-center text-center px-4">
                <Fingerprint className={`w-12 h-12 mb-1.5 ${isPressing ? 'text-blue-400 scale-110' : 'text-slate-500'} transition-transform`} />
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                  {isPressing 
                    ? (language === 'ar' ? 'جاري الكشف...' : 'Revealing...') 
                    : (language === 'ar' ? 'اضغط مطولاً ثانية' : 'Hold 1s to Reveal')}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            {isRtl 
              ? 'يتطلب الضغط المستمر لمنع تسرب الدور بالخطأ.' 
              : 'Requires continuous press to prevent accidental visual leak.'}
          </div>
        </div>
      )}

      {/* 3. Step: SHOW ASSIGNED ROLE */}
      {step === 'SHOW_ROLE' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="flex justify-center mb-2">
              {getRoleIcon(activePlayer.role.type)}
            </div>

            <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">{language === 'ar' ? 'دورك السري الخاص' : 'YOUR SECRET ROLE'}</p>
            
            <h2 className="text-3xl font-black tracking-tight font-display" style={{ color: activePlayer.role.color }}>
              {localizedRole.name}
            </h2>

            {/* Team allegiance badge */}
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
              style={{ 
                backgroundColor: `${activePlayer.role.color}15`, 
                borderColor: `${activePlayer.role.color}40`,
                borderWidth: '1px',
                color: activePlayer.role.color 
              }}
            >
              {isRtl ? 'فريق: ' : 'Team: '} 
              {activePlayer.role.team === 'MAFIA' 
                ? (language === 'ar' ? 'المافيا ☠️' : 'MAFIA')
                : (language === 'ar' ? 'القرية 🕊️' : 'TOWN')}
            </div>

            {/* Objective & Description Cards */}
            <div className="bg-[#0A0F1D]/80 border border-slate-800 rounded-xl p-4 mt-4 text-left space-y-3 font-medium">
              <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">🎯 {language === 'ar' ? 'الهدف الأساسي' : 'Core Objective'}</p>
                <p className="text-xs text-slate-300 mt-0.5">{localizedRole.objective}</p>
              </div>
              <div className={`border-t border-slate-800/60 pt-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">✨ {language === 'ar' ? 'القدرة والميزة' : 'Role Ability'}</p>
                <p className="text-xs text-slate-300 mt-0.5">{localizedRole.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSeenRole}
              className="w-full font-extrabold py-4 rounded-xl shadow-lg transition-colors cursor-pointer text-white uppercase text-sm tracking-wider"
              style={{ backgroundColor: activePlayer.role.color }}
            >
              {t.iveSeenRole}
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">
              {isRtl 
                ? 'تختفي معلومات دورك فوراً بمجرد الضغط. احفظها سراً!'
                : 'Screen clears instantly upon clicking. Keep it secret!'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Step: PASS DEVICE TO CENTER (FACE DOWN) */}
      {step === 'LOCK_DOWN' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#0A0F1D] -mx-4 px-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="my-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 animate-pulse">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide font-display">{language === 'ar' ? 'شاشة مؤمنة سرياً' : 'Locked Screen'}</h2>
              <p className="text-xs font-mono text-slate-500 uppercase mt-2">{language === 'ar' ? 'مرحلة التمرير' : 'Passing Phase'}</p>
            </div>
            
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
              {isRtl 
                ? 'ضع الهاتف سرياً متوجهاً لأسفل في منتصف الطاولة، أو مرره بكل هدوء للاعب التالي.'
                : 'Place the phone face down in the center of the table, or safely pass it to the next player.'}
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextPlayerTransfer}
              className="w-full bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-770 font-extrabold py-4 rounded-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
            >
              {language === 'ar' ? 'تم التمرير: اللاعب التالي' : 'Transfer Complete: Next Player ➔'}
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">
              {isRtl 
                ? `اللاعب التالي: ${players[currentPlayerIndex + 1]?.name}`
                : `Up Next: Player ${currentPlayerIndex + 2}`}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
