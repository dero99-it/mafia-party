/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, GameLogEntry } from '../../types';
import { sfx } from '../../utils/audio';
import { translations, getLocalizedRoleDetails } from '../../utils/translations';
import { 
  Sun, Skull, Heart, Shield, Clock, Play, Pause, FastForward, 
  BookOpen, X 
} from 'lucide-react';

interface DayScreenProps {
  round: number;
  players: Player[];
  discussionTime: number; // in seconds
  killedPlayerId: string | null;
  protectedPlayerId: string | null;
  logs: GameLogEntry[];
  onStartVoting: () => void;
  language: 'en' | 'ar';
}

export const DayScreen: React.FC<DayScreenProps> = ({
  round,
  players,
  discussionTime,
  killedPlayerId,
  protectedPlayerId,
  logs,
  onStartVoting,
  language
}) => {
  const [step, setStep] = useState<'DAWN' | 'ANNOUNCEMENT' | 'DISCUSSION'>('DAWN');
  const [timeLeft, setTimeLeft] = useState(discussionTime);
  const [timerActive, setTimerActive] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const t = translations[language];
  const isRtl = language === 'ar';

  // Determine if there is a death this round
  const actualDeathId = killedPlayerId !== protectedPlayerId ? killedPlayerId : null;
  const deadPlayer = actualDeathId ? players.find(p => p.id === actualDeathId) : null;
  const wasSaved = killedPlayerId && killedPlayerId === protectedPlayerId;

  // 1. Dawn intro transition triggers sound
  useEffect(() => {
    sfx.playNightAmbient();
    const timer = setTimeout(() => {
      setStep('ANNOUNCEMENT');
      if (deadPlayer) {
        if (deadPlayer.role.type === 'MAFIA') {
          sfx.playMafiaDeath(); // Play optimistic sound for Mafia death
        } else {
          sfx.playCitizenDeath(); // Play mournful sad sound for Citizen/Townsperson death
        }
      } else {
        sfx.playVictory(); // Cheerful sound since someone was saved/no one died
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [killedPlayerId, protectedPlayerId, deadPlayer]);

  // 2. Countdown logic during discussion
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'DISCUSSION' && timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            sfx.playDefeat(); // Out of time sound
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timerActive, timeLeft]);

  const handleStartDiscussion = () => {
    sfx.playClick();
    setStep('DISCUSSION');
    setTimerActive(true);
  };

  const toggleTimer = () => {
    sfx.playClick();
    setTimerActive(prev => !prev);
  };

  const handleSkipTime = () => {
    sfx.playClick();
    setTimeLeft(0);
    setTimerActive(false);
  };

  const handleAdd30s = () => {
    sfx.playClick();
    setTimeLeft(prev => prev + 30);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      className="w-full max-w-md mx-auto px-4 py-8 text-slate-100 font-sans min-h-[500px] flex flex-col justify-between fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* STEP 1: DAWN TRANSITION ANIMATION */}
      {step === 'DAWN' && (
        <div className="flex-1 flex flex-col justify-center items-center py-10 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center animate-spin-slow shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Sun className="w-12 h-12 text-amber-400" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest font-mono text-amber-500 font-bold animate-pulse">
              {isRtl ? 'خيوط الفجر تلوح...' : 'Dawn is Breaking'}
            </p>
            <h2 className="text-3xl font-black text-white font-display">
              {isRtl ? 'تشرق الشمس...' : 'The Sun Rises...'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isRtl ? 'جاري معالجة أحداث الليل السرية...' : 'Processing secret night maneuvers'}
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: MORNING/DEATH ANNOUNCEMENT */}
      {step === 'ANNOUNCEMENT' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl animate-fade-in">
          <div className="space-y-6 my-auto">
            <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">
              {isRtl ? `تقرير الصباح — الجولة ${round}` : `Morning Report — Round ${round}`}
            </p>
            
            {deadPlayer ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-md">
                  <Skull className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 font-display">
                  {isRtl ? 'في ليلة البارحة...' : 'Last night...'}
                </h3>
                <div className="bg-[#0A0F1D]/80 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto shadow-inner">
                  <p className="text-2xl font-black text-red-400 font-display">{deadPlayer.name}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {isRtl ? 'عُثر عليه جثة هامدة باردة.' : 'was found cold and dead.'}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-red-500 font-bold">
                      {isRtl ? 'الدور المكشوف' : 'Revealed Role'}
                    </span>
                    <span className="text-sm font-black mt-1 font-display" style={{ color: deadPlayer.role.color }}>
                      {getLocalizedRoleDetails(deadPlayer.role.type, language).name}
                    </span>
                  </div>
                </div>
              </div>
            ) : wasSaved ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
                  <Heart className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 font-display">
                  {isRtl ? 'في ليلة البارحة...' : 'Last night...'}
                </h3>
                <div className="bg-[#0A0F1D]/80 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto space-y-2 shadow-inner">
                  <p className="text-xl font-black text-emerald-400 font-display">
                    {isRtl ? 'تم إنقاذ حياة لاعب! ❤️' : 'A life was saved! ❤️'}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {isRtl 
                      ? 'لقد حاول أفراد المافيا تصفية أحد اللاعبين، ولكن التدخل السريع من الطبيب أنقذ حياته بالكامل!'
                      : "Someone was viciously attacked by the Mafia, but the Doctor's swift intervention saved their life!"}
                  </p>
                  <p className="text-xs font-black text-white mt-2 uppercase tracking-wide">
                    {isRtl ? 'لم يمت أحد.' : 'No one died.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-400">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 font-display">
                  {isRtl ? 'في ليلة البارحة...' : 'Last night...'}
                </h3>
                <div className="bg-[#0A0F1D]/80 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto shadow-inner">
                  <p className="text-xl font-black text-slate-300 font-display">
                    {isRtl ? 'مرت الليلة بهدوء وسلام.' : 'Nothing happened.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {isRtl 
                      ? 'كانت ليلة هادئة للغاية. لم تُسجَّل أي هجمات أو وفيات على الإطلاق.'
                      : 'A silent night. No attacks or casualties were recorded.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleStartDiscussion}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer uppercase font-mono tracking-wider"
            >
              {t.startDayDiscussion} ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DAY DISCUSSION SCREEN */}
      {step === 'DISCUSSION' && (
        <div className="flex-1 flex flex-col justify-between py-2 bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          
          {/* Header Panel */}
          <div className="flex justify-between items-center bg-[#0A0F1D] border border-slate-800 p-3 rounded-xl mb-4">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                {isRtl ? 'مرحلة اللعبة' : 'GAME PHASE'}
              </p>
              <h3 className="text-sm font-black text-white font-display">
                {isRtl ? 'النهار والبحث عن المتهم' : 'Day Discussion'}
              </h3>
            </div>
            
            {/* Log Toggle Button */}
            <button
              onClick={() => { sfx.playClick(); setShowLog(true); }}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/20 border border-blue-900/40 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.viewGameLogs}</span>
            </button>
          </div>

          {/* Animated Countdown Timer Block */}
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 text-center space-y-3 shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 20 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${timeLeft <= 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={toggleTimer}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {timerActive ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                <span>{timerActive ? (isRtl ? 'إيقاف' : 'Pause') : (isRtl ? 'تشغيل' : 'Resume')}</span>
              </button>
              <button
                onClick={handleAdd30s}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                +30s
              </button>
              <button
                onClick={handleSkipTime}
                className="bg-red-950/30 hover:bg-red-950/50 border border-red-900/30 text-red-400 p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تخطي' : 'Skip'}</span>
              </button>
            </div>
          </div>

          {/* Alive / Dead Player Status List */}
          <div className="my-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1 font-bold">
              {isRtl ? 'شبكة حالة اللاعبين الحالية' : 'PLAYER STATUS GRID'}
            </p>
            
            <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {players.map(p => (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${p.isAlive ? 'bg-[#0A0F1D]/60 border-slate-800' : 'bg-red-950/10 border-red-950/20 opacity-50'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.isAlive ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                  </div>
                  
                  {!p.isAlive && (
                    <span className="text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/30" style={{ color: p.role.color }}>
                      {getLocalizedRoleDetails(p.role.type, language).name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Proceed to Voting Call-To-Action */}
          <div>
            <button
              onClick={() => { sfx.playClick(); onStartVoting(); }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all text-base cursor-pointer uppercase font-mono tracking-wider"
            >
              {t.startVoting} ➔
            </button>
            <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
              {isRtl 
                ? 'انتهى النقاش العلني. يرجى تمرير الهاتف للتصويت السري على المتهمين.'
                : 'Debate closed. Pass the phone around to vote anonymously.'}
            </p>
          </div>
        </div>
      )}

      {/* GAME LOG SLIDE-OUT OVERLAY */}
      {showLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-sm bg-[#0A0F1D] border-l border-slate-800 h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2 font-display uppercase tracking-tight">
                  <BookOpen className="w-5 h-5 text-blue-400" /> {t.gameLogsTitle}
                </h3>
                <button
                  onClick={() => { sfx.playClick(); setShowLog(false); }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Log List */}
              <div className="space-y-3 overflow-y-auto max-h-[80vh] pr-1">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10 font-mono">
                    {isRtl ? 'لم تُسجل أي أحداث تاريخية بعد.' : 'No historic logs recorded yet.'}
                  </p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="bg-[#1E293B] p-3 rounded-xl border border-slate-750 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold">
                        <span>{isRtl ? `الجولة ${log.round}` : `ROUND ${log.round}`}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 text-center">
              <button
                onClick={() => { sfx.playClick(); setShowLog(false); }}
                className="w-full bg-[#1E293B] hover:bg-slate-800 text-slate-300 font-extrabold py-3 rounded-xl border border-slate-700 text-xs cursor-pointer uppercase tracking-wider font-mono"
              >
                {t.closeLogs}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
