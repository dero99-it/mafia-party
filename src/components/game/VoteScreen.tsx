/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Player, VotingMode } from '../../types';
import { sfx } from '../../utils/audio';
import { translations } from '../../utils/translations';
import { 
  AlertTriangle, Fingerprint, CheckCircle, Vote, Info 
} from 'lucide-react';

interface VoteScreenProps {
  players: Player[];
  votingMode: VotingMode;
  onFinishVoting: (eliminatedPlayerId: string | null, votingTally: Record<string, string>) => void;
  language: 'en' | 'ar';
}

export const VoteScreen: React.FC<VoteScreenProps> = ({
  players,
  votingMode,
  onFinishVoting,
  language
}) => {
  // Queue of alive players who will vote
  const [voters, setVoters] = useState<Player[]>([]);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [step, setStep] = useState<'TRANSFER' | 'PRIVACY' | 'ACTION' | 'LOCK_DOWN' | 'TABLE_VOTE'>('TRANSFER');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null); // null means skip/abstain

  // Accumulate votes: key is voterId, value is targetPlayerId (or 'skip')
  const [votes, setVotes] = useState<Record<string, string>>({});

  // Press reveal progress for private passing
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // For Table Mode: hold live tallies
  const [tableVotes, setTableVotes] = useState<Record<string, string>>({});

  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    const alive = players.filter(p => p.isAlive);
    setVoters(alive);

    if (votingMode === 'TABLE_MODE') {
      setStep('TABLE_VOTE');
      // Initialize table votes with 'skip' (abstain) by default
      const initial: Record<string, string> = {};
      alive.forEach(v => {
        initial[v.id] = 'skip';
      });
      setTableVotes(initial);
    } else {
      setStep('TRANSFER');
    }
  }, [players, votingMode]);

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

  // 1s Long Press Authorization
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

  const activeVoter = voters[currentVoterIndex];

  // Grid filter: can't vote for dead players or yourself
  const getEligibleTargets = (voterId: string) => {
    return players.filter(p => p.isAlive && p.id !== voterId);
  };

  const handleSelectVote = (targetId: string | null) => {
    sfx.playClick();
    setSelectedTargetId(targetId);
  };

  const handleConfirmVote = () => {
    if (!activeVoter) return;
    sfx.playClick();

    // Store vote
    const voterId = activeVoter.id;
    const choice = selectedTargetId || 'skip';
    const updatedVotes = { ...votes, [voterId]: choice };
    setVotes(updatedVotes);

    setStep('LOCK_DOWN');
  };

  const handleNextVoter = () => {
    sfx.playClick();
    setSelectedTargetId(null);

    if (currentVoterIndex < voters.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
      setStep('TRANSFER');
    } else {
      resolveAndSubmitVotes(votes);
    }
  };

  // Table Mode voting assignment
  const handleTableVoteChange = (voterId: string, targetId: string) => {
    sfx.playClick();
    setTableVotes(prev => ({
      ...prev,
      [voterId]: targetId
    }));
  };

  const handleTableSubmit = () => {
    sfx.playClick();
    resolveAndSubmitVotes(tableVotes);
  };

  // Core Voting Engine logic: Tally and resolve ties
  const resolveAndSubmitVotes = (finalVotes: Record<string, string>) => {
    // Tally votes
    const tally: Record<string, number> = {};
    
    // Initialize tally for all alive players with 0 votes
    voters.forEach(v => {
      tally[v.id] = 0;
    });

    // Accumulate votes
    Object.values(finalVotes).forEach(targetId => {
      if (targetId && targetId !== 'skip') {
        tally[targetId] = (tally[targetId] || 0) + 1;
      }
    });

    // Find highest vote count
    let maxVotes = 0;
    let candidatesWithMax: string[] = [];

    Object.entries(tally).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        candidatesWithMax = [playerId];
      } else if (count === maxVotes && count > 0) {
        candidatesWithMax.push(playerId);
      }
    });

    // Resolve outcome: Tie or skip victory means nobody eliminated
    let eliminatedId: string | null = null;
    if (candidatesWithMax.length === 1 && maxVotes > 0) {
      eliminatedId = candidatesWithMax[0];
    }

    onFinishVoting(eliminatedId, finalVotes);
  };

  return (
    <div 
      className="w-full max-w-md mx-auto px-4 py-8 text-slate-100 font-sans min-h-[500px] flex flex-col justify-between fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* ================= MODE A: PRIVATE PASS & PLAY SEQUENTIAL ================= */}
      
      {/* 1. Step: TRANSFER PHONE */}
      {votingMode === 'PASS_PLAY' && step === 'TRANSFER' && activeVoter && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl animate-fade-in">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-400 shadow-md">
              <Vote className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">
              {isRtl ? 'التصويت السري الفردي' : 'ANONYMOUS BALLOT'}
            </p>
            <h2 className="text-2xl font-black text-white font-display">
              {isRtl ? `أعطِ الهاتف إلى ${activeVoter.name}` : `Pass to ${activeVoter.name}`}
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
              {isRtl 
                ? `يرجى تسليم الهاتف للاعب ${activeVoter.name} للإدلاء بصوته السري دون أن يراه أحد.`
                : `Please hand the phone to ${activeVoter.name} to record their private vote.`}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleImReady}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer"
            >
              {isRtl ? `أنا ${activeVoter.name}، أنا جاهز` : `I am ${activeVoter.name}, I'm Ready ➔`}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              {isRtl 
                ? `المصوت رقم ${currentVoterIndex + 1} من أصل ${voters.length}`
                : `Voter ${currentVoterIndex + 1} of ${voters.length}`}
            </p>
          </div>
        </div>
      )}

      {/* 2. Step: PRIVACY BLOCK */}
      {votingMode === 'PASS_PLAY' && step === 'PRIVACY' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 animate-bounce shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">
              {isRtl ? 'حماية سرية التصويت' : 'Privacy Screen'}
            </p>
            <h2 className="text-2xl font-black text-white font-display">
              {isRtl ? 'غطِّ الشاشة فوراً! 🫣' : 'Cover the screen! 🫣'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
              {isRtl 
                ? 'تصويتك سري ومحمي بالكامل. يرجى التأكد من عدم وقوف أي لاعب بجوارك.'
                : 'Your vote is completely anonymous. Make sure other players are not hovering around.'}
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
                    : (isRtl ? 'اضغط مطولاً للتصويت' : 'Hold 1s to Vote')}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            {isRtl 
              ? 'اضغط مطولاً لفتح واجهة التصويت الفردي بأمان.'
              : 'Hold down to open the voting interface safely.'}
          </div>
        </div>
      )}

      {/* 3. Step: ANONYMOUS VOTE SELECTION */}
      {votingMode === 'PASS_PLAY' && step === 'ACTION' && activeVoter && (
        <div className="flex-1 flex flex-col justify-between py-6 bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl animate-fade-in">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-md">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">
                {isRtl ? `${activeVoter.name}، أدلِ بصوتك` : `${activeVoter.name}, cast your vote`}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 font-medium">
                {isRtl 
                  ? 'اختر من تشك في كونه فرداً من المافيا، أو امتنع عن التصويت إذا لم تكن متأكداً.'
                  : 'Select who you suspect of being in the Mafia, or skip if unsure.'}
              </p>
            </div>
          </div>

          {/* Player Grid & Abstain Option */}
          <div className="my-6 space-y-4">
            <div className="grid grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
              {getEligibleTargets(activeVoter.id).map(p => {
                const isSelected = selectedTargetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectVote(p.id)}
                    className={`p-3 rounded-xl border text-xs font-black text-center transition-all cursor-pointer ${isSelected ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' : 'bg-[#0A0F1D] border-slate-800 text-slate-300 hover:border-slate-700'}`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800/80 pt-3">
              <button
                onClick={() => handleSelectVote(null)}
                className={`w-full p-3 rounded-xl border text-xs font-black text-center transition-all cursor-pointer ${selectedTargetId === null ? 'bg-amber-600/20 border-amber-500 text-amber-400 font-bold' : 'bg-[#0A0F1D] border-slate-800 text-slate-400 hover:border-slate-700 font-bold'}`}
              >
                {isRtl ? 'الامتناع عن التصويت 🤐' : 'Abstain / Skip Vote 🤐'}
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleConfirmVote}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all cursor-pointer uppercase text-sm tracking-wider"
            >
              {isRtl ? 'تأكيد تصويتك ➔' : 'Confirm Vote ➔'}
            </button>
            <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
              {isRtl 
                ? 'تُجمع الأصوات سرياً ومجهولاً، وتظهر النتائج مجمعة بعد التصويت.'
                : 'Votes are combined anonymously at the end of the phase.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Step: SECURE TRANSFER LOCKDOWN */}
      {votingMode === 'PASS_PLAY' && step === 'LOCK_DOWN' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center bg-[#0A0F1D] -mx-4 px-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="my-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide font-display">
                {isRtl ? 'تم تسجيل صوتك السري' : 'Vote Registered'}
              </h2>
              <p className="text-xs font-mono text-slate-500 uppercase mt-2">{isRtl ? 'مرحلة التمرير' : 'Passing Phase'}</p>
            </div>
            
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
              {isRtl 
                ? 'تم تسجيل بطاقة تصويتك سرياً ومجهولاً بالكامل. يرجى تسليم الهاتف للاعب التالي، أو وضعه متوجهاً لأسفل.'
                : 'Your ballot has been securely and anonymously cataloged. Please pass the phone face down to the center.'}
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextVoter}
              className="w-full bg-[#1E293B] hover:bg-slate-855 text-slate-200 border border-slate-700 font-extrabold py-4 rounded-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
            >
              {currentVoterIndex < voters.length - 1 
                ? (isRtl ? 'تم التمرير: اللاعب التالي ➔' : 'Transfer Complete: Next Player ➔') 
                : (isRtl ? 'اكتملت جميع الأصوات: كشف النتائج ➔' : 'All Ballots Gathered: Calculate Results ➔')}
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">
              {currentVoterIndex < voters.length - 1 
                ? (isRtl ? `التالي: اللاعب ${voters[currentVoterIndex + 1]?.name}` : `Up Next: Player ${currentVoterIndex + 2}`) 
                : (isRtl ? 'جاري تجميع وحساب بطاقات الاقتراع...' : 'Tallying anonymous votes...')}
            </p>
          </div>
        </div>
      )}

      {/* ================= MODE B: SIMULTANEOUS TABLE CENTER TALLY ================= */}
      
      {step === 'TABLE_VOTE' && (
        <div className="flex-1 flex flex-col justify-between py-6 bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#0A0F1D] border border-slate-800 p-3 rounded-xl">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  {isRtl ? 'نمط الطاولة المباشر' : 'TABLE MODE'}
                </p>
                <h3 className="text-sm font-black text-white font-display">
                  {isRtl ? 'تصويت علني جماعي' : 'Simultaneous Voting'}
                </h3>
              </div>
              <Info className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-xs text-slate-400 leading-normal font-medium">
              {isRtl 
                ? 'ضع الهاتف في منتصف الطاولة. اطلب من الجميع التصويت علانية برفع الأيدي، ثم أدخل الأصوات أدناه.'
                : 'Place the phone in the center of the table. Have everyone vote aloud or raise hands, then record the choices below.'}
            </p>

            {/* Table Tally List */}
            <div className="space-y-2 overflow-y-auto max-h-[280px] pr-1">
              {voters.map(voter => (
                <div key={voter.id} className="bg-[#0A0F1D] border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{voter.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-mono font-bold">{isRtl ? 'اللاعب المصوّت' : 'Voter'}</p>
                  </div>
                  
                  <select
                    value={tableVotes[voter.id] || 'skip'}
                    onChange={e => handleTableVoteChange(voter.id, e.target.value)}
                    className="bg-[#1E293B] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="skip">{isRtl ? 'امتناع / تخطي' : 'Abstain / Skip'}</option>
                    {getEligibleTargets(voter.id).map(target => (
                      <option key={target.id} value={target.id}>
                        {isRtl ? `صوّت ضد: ${target.name}` : `Vote: ${target.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleTableSubmit}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer uppercase font-mono tracking-wider"
            >
              {isRtl ? 'إرسال واحتساب الأصوات العلنية ➔' : 'Submit Table Ballots ➔'}
            </button>
            <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
              {isRtl 
                ? 'يفك التعادل ويعرض النتائج المكشوفة فوراً.'
                : 'Resolves ties and reveals final result instantly.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
