/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Player, RoleType, NightActionsState } from '../../types';
import { sfx } from '../../utils/audio';
import { translations } from '../../utils/translations';
import { 
  Moon, Shield, Search, Skull, AlertTriangle, Fingerprint, 
  Users, CheckCircle 
} from 'lucide-react';

interface NightScreenProps {
  players: Player[];
  onFinishNight: (actions: NightActionsState, investigationLogs: string[]) => void;
  language: 'en' | 'ar';
}

interface NightTurn {
  playerId: string;
  playerName: string;
  roleType: RoleType;
  title: string;
  instruction: string;
}

export const NightScreen: React.FC<NightScreenProps> = ({ 
  players, 
  onFinishNight,
  language
}) => {
  const [turns, setTurns] = useState<NightTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [step, setStep] = useState<'TRANSFER' | 'PRIVACY' | 'ACTION' | 'RESULT' | 'LOCK_DOWN'>('TRANSFER');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  
  // Investigation output for Detective
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);

  // Night Actions accumulated
  const [actions, setActions] = useState<NightActionsState>({
    protectedPlayerId: null,
    investigatedPlayerId: null,
    killedPlayerId: null
  });

  // Detective reports list
  const [detLogs, setDetLogs] = useState<string[]>([]);

  // Press reveal progress
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const isRtl = language === 'ar';

  // 1. Build Night Queue on mount
  useEffect(() => {
    sfx.playNightAmbient();
    const queue: NightTurn[] = [];

    // Filter alive players
    const alivePlayers = players.filter(p => p.isAlive);

    // Turn 1: Doctor (if alive)
    const doctor = alivePlayers.find(p => p.role.type === RoleType.DOCTOR);
    if (doctor) {
      queue.push({
        playerId: doctor.id,
        playerName: doctor.name,
        roleType: RoleType.DOCTOR,
        title: t.doctorTurnTitle,
        instruction: t.doctorInstruction
      });
    }

    // Turn 2: Detective (if alive)
    const detective = alivePlayers.find(p => p.role.type === RoleType.DETECTIVE);
    if (detective) {
      queue.push({
        playerId: detective.id,
        playerName: detective.name,
        roleType: RoleType.DETECTIVE,
        title: t.detectiveTurnTitle,
        instruction: t.detectiveInstruction
      });
    }

    // Turn 3: Mafia (if any alive)
    const aliveMafias = alivePlayers.filter(p => p.role.type === RoleType.MAFIA);
    aliveMafias.forEach((mafia, index) => {
      queue.push({
        playerId: mafia.id,
        playerName: mafia.name,
        roleType: RoleType.MAFIA,
        title: isRtl 
          ? `دور المافيا 🔪 (عضو ${index + 1})`
          : `Mafia Turn (Member ${index + 1})`,
        instruction: t.mafiaInstruction
      });
    });

    setTurns(queue);
    
    // If no active roles are alive, immediately finish night with null actions
    if (queue.length === 0) {
      onFinishNight({
        protectedPlayerId: null,
        investigatedPlayerId: null,
        killedPlayerId: null
      }, []);
    }
  }, [players, language]);

  const clearTimers = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleImReady = () => {
    sfx.playClick();
    setStep('PRIVACY');
  };

  // Long press authorization to open role action panel
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clearTimers();
    sfx.playClick();
    setIsPressing(true);
    setPressProgress(0);

    const duration = 1000;
    const stepTime = 20;
    let currentMs = 0;

    progressIntervalRef.current = setInterval(() => {
      currentMs += stepTime;
      const progress = Math.min((currentMs / duration) * 100, 100);
      setPressProgress(progress);

      if (progress >= 100) {
        clearTimers();
        setIsPressing(false);
        setStep('ACTION');
      }
    }, stepTime);
  };

  const handlePressEnd = () => {
    clearTimers();
    setIsPressing(false);
    setPressProgress(0);
  };

  const activeTurn = turns[currentTurnIndex];

  const handleSelectTarget = (targetId: string) => {
    sfx.playClick();
    setSelectedTargetId(targetId);
  };

  const handleConfirmAction = () => {
    if (!activeTurn || !selectedTargetId) return;
    sfx.playClick();

    const target = players.find(p => p.id === selectedTargetId);
    if (!target) return;

    let updatedActions = { ...actions };

    if (activeTurn.roleType === RoleType.DOCTOR) {
      updatedActions.protectedPlayerId = selectedTargetId;
      setActions(updatedActions);
      setStep('LOCK_DOWN');
    } 
    else if (activeTurn.roleType === RoleType.DETECTIVE) {
      updatedActions.investigatedPlayerId = selectedTargetId;
      setActions(updatedActions);
      
      // Compute investigation outcome
      const isMafia = target.role.type === RoleType.MAFIA;
      const outcome = isMafia ? t.alignmentMafia : t.alignmentTown;
      setInvestigationResult(outcome);
      setDetLogs(prev => [...prev, isRtl 
        ? `🕵️ المحقق حقق مع ${target.name} ووجده: ${isMafia ? 'مافيا ☠️' : 'مواطن بريء 🕊️'}`
        : `🕵️ Detective checked ${target.name}: Found ${isMafia ? 'Mafia ☠️' : 'Town 🕊️'}`
      ]);
      setStep('RESULT');
    } 
    else if (activeTurn.roleType === RoleType.MAFIA) {
      updatedActions.killedPlayerId = selectedTargetId;
      setActions(updatedActions);
      setStep('LOCK_DOWN');
    }
  };

  const handleDismissResult = () => {
    sfx.playClick();
    setStep('LOCK_DOWN');
  };

  const handleNextTurnTransfer = () => {
    sfx.playClick();
    setSelectedTargetId(null);
    setInvestigationResult(null);

    if (currentTurnIndex < turns.length - 1) {
      setCurrentTurnIndex(prev => prev + 1);
      setStep('TRANSFER');
    } else {
      onFinishNight(actions, detLogs);
    }
  };

  // Get only alive players as targets
  const getValidTargets = () => {
    if (!activeTurn) return [];
    
    // For Doctor, can target anyone alive
    if (activeTurn.roleType === RoleType.DOCTOR) {
      return players.filter(p => p.isAlive);
    }
    
    // For Detective, target anyone alive except themselves
    if (activeTurn.roleType === RoleType.DETECTIVE) {
      return players.filter(p => p.isAlive && p.id !== activeTurn.playerId);
    }
    
    // For Mafia, target anyone alive except themselves
    if (activeTurn.roleType === RoleType.MAFIA) {
      return players.filter(p => p.isAlive && p.role.type !== RoleType.MAFIA);
    }

    return players.filter(p => p.isAlive);
  };

  const getRoleIcon = (roleType: RoleType) => {
    switch (roleType) {
      case RoleType.DOCTOR:
        return <Shield className="w-12 h-12 text-emerald-400" />;
      case RoleType.DETECTIVE:
        return <Search className="w-12 h-12 text-amber-400" />;
      case RoleType.MAFIA:
        return <Skull className="w-12 h-12 text-red-500" />;
      default:
        return <Users className="w-12 h-12 text-blue-400" />;
    }
  };

  if (turns.length === 0 || !activeTurn) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-20 text-slate-400 font-mono text-xs">
        {isRtl ? 'جاري تحضير مرحلة الليل...' : 'Preparing night cycles...'}
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-md mx-auto px-4 py-8 text-slate-100 font-sans min-h-[500px] flex flex-col justify-between fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* 1. Step: TRANSFER TO ACTIVE PLAYER */}
      {step === 'TRANSFER' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-400 animate-pulse shadow-md">
              <Moon className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">
              {isRtl ? 'أفعال سرية ليلية' : 'NIGHT COVERT OPERATIONS'}
            </p>
            <h2 className="text-2xl font-black text-white font-display">
              {isRtl ? `أعطِ الهاتف إلى ${activeTurn.playerName}` : `Pass to ${activeTurn.playerName}`}
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
              {isRtl 
                ? `يرجى تسليم الهاتف للاعب ${activeTurn.playerName} على انفراد. لا تترك الآخرين ينظرون للهاتف!`
                : `Please hand the device to ${activeTurn.playerName}. No other player should look at the choices.`}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleImReady}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer animate-pulse"
            >
              {isRtl ? `أنا ${activeTurn.playerName}، أنا جاهز` : `I am ${activeTurn.playerName}, I'm Ready ➔`}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              {isRtl
                ? `الفعل الليلي رقم ${currentTurnIndex + 1} من أصل ${turns.length}`
                : `Night turn ${currentTurnIndex + 1} of ${turns.length}`}
            </p>
          </div>
        </div>
      )}

      {/* 2. Step: PRIVACY EXPLICIT WARNING */}
      {step === 'PRIVACY' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 animate-bounce shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">
              {isRtl ? 'حماية الخصوصية' : 'Tactical Privacy Barrier'}
            </p>
            <h2 className="text-2xl font-black text-white font-display">
              {isRtl ? 'هل أنت بمفردك تماماً؟ 🤫' : 'Are you alone? 🤫'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
              {isRtl 
                ? 'أنت على وشك القيام بفعلك السري. أي تلصص سيفسد توازن ومتعة اللعبة.'
                : 'You are about to act. Peeking will ruin the game balance.'}
            </p>
          </div>

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
                <Fingerprint className={`w-12 h-12 mb-1.5 ${isPressing ? 'text-blue-400 scale-110' : 'text-slate-500'}`} />
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                  {isPressing 
                    ? (isRtl ? 'جاري التحقق...' : 'Authorizing...') 
                    : (isRtl ? 'اضغط مطولاً ثانية' : 'Hold 1s to Unlock')}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            {isRtl 
              ? 'تطلب الشاشة ضغطاً مطولاً لثانية واحدة لفتح لوحة التحكم.'
              : 'Requires continuous press to unlock secret action panel.'}
          </div>
        </div>
      )}

      {/* 3. Step: NIGHT ACTION PANEL */}
      {step === 'ACTION' && (
        <div className="flex-1 flex flex-col justify-between py-6 bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl animate-fade-in">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              {getRoleIcon(activeTurn.roleType)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-display">{activeTurn.title}</h2>
              <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto mt-1 leading-normal uppercase tracking-wider font-mono">
                {activeTurn.instruction}
              </p>
            </div>
          </div>

          {/* Target Grid */}
          <div className="my-6 grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {getValidTargets().map(p => {
              const isSelected = selectedTargetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectTarget(p.id)}
                  className={`p-3 rounded-xl border text-xs font-black text-center transition-all cursor-pointer ${isSelected ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg' : 'bg-[#0A0F1D] border-slate-800 text-slate-300 hover:border-slate-700'}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          <div>
            <button
              onClick={handleConfirmAction}
              disabled={!selectedTargetId}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all cursor-pointer uppercase text-sm tracking-wider"
            >
              {t.confirmAction} ➔
            </button>
            <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
              {isRtl ? 'لا يمكن تعديل الاختيار بعد تأكيده.' : 'Selection cannot be changed once confirmed.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Step: DETECTIVE INQUIRY RESULT OUTCOME */}
      {step === 'RESULT' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 shadow-md">
              <Search className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">{t.investigationResult}</p>
              <h2 className="text-2xl font-black text-white font-display">
                {isRtl ? 'اكتمل التحقيق السري' : 'Investigation Complete'}
              </h2>
            </div>

            <div className="bg-[#0A0F1D] border border-slate-800 rounded-xl p-5 max-w-sm mx-auto shadow-inner">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono font-bold">
                {isRtl ? 'الانحياز والانتماء الحقيقي' : 'True Allegiance'}
              </p>
              <p className="text-base font-black text-slate-200 mt-2 font-display">
                {investigationResult}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleDismissResult}
              className="w-full bg-[#0A0F1D] hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold py-4 rounded-xl transition-all cursor-pointer uppercase text-sm tracking-wider"
            >
              {isRtl ? 'فهمت، اخفِ النتيجة الحساسة ➔' : 'I Understand, Hide Result ➔'}
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">
              {isRtl 
                ? 'يمسح الشاشة فوراً. تأكد أن أحداً لا ينظر إليك!'
                : 'Wipes the screen immediately. Ensure nobody is peeking!'}
            </p>
          </div>
        </div>
      )}

      {/* 5. Step: LOCK SCREEN & PLACE PHONE FACE DOWN */}
      {step === 'LOCK_DOWN' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#0A0F1D] -mx-4 px-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="my-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide font-display">
                {isRtl ? 'تم تسجيل فعلك السري' : 'Action Recorded'}
              </h2>
              <p className="text-xs font-mono text-slate-500 uppercase mt-2">{isRtl ? 'مرحلة التمرير' : 'Passing Phase'}</p>
            </div>
            
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
              {isRtl 
                ? 'تم حفظ اختيارك بنجاح. يرجى وضع الهاتف متوجهاً لأسفل في منتصف الطاولة أو تمريره بهدوء للاعب التالي.'
                : 'Selection registered. Pass the phone face down to the center or hand it to the next player.'}
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextTurnTransfer}
              className="w-full bg-[#1E293B] hover:bg-slate-850 text-slate-200 border border-slate-700 font-extrabold py-4 rounded-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
            >
              {currentTurnIndex < turns.length - 1 
                ? (isRtl ? 'اكتمل التمرير: اللاعب التالي ➔' : 'Transfer Complete: Next Player ➔') 
                : (isRtl ? 'اكتملت جميع أفعال الليل: استيقاظ 🌅' : 'All Actions Recorded: Open Morning ➔')}
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">
              {currentTurnIndex < turns.length - 1 
                ? (isRtl ? `التالي: الدور رقم ${currentTurnIndex + 2}` : `Up Next: Turn ${currentTurnIndex + 2}`) 
                : (isRtl ? 'الشمس على وشك الشروق...' : 'The sun is about to rise...')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
