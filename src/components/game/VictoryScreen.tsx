/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Player, Team, GameStats } from '../../types';
import { sfx } from '../../utils/audio';
import { AdPlaceholder } from '../ads/AdPlaceholder';
import { Trophy, RefreshCw, Home, Award } from 'lucide-react';
import { translations, getLocalizedRoleDetails } from '../../utils/translations';

interface VictoryScreenProps {
  stats: GameStats;
  players: Player[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  language: 'en' | 'ar';
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats,
  players,
  onPlayAgain,
  onGoHome,
  language
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    // Play dramatic finish fanfare
    if (stats.winnerTeam === Team.TOWN) {
      sfx.playVictory();
    } else {
      sfx.playDefeat();
    }
  }, [stats.winnerTeam]);

  const totalMafia = players.filter(p => p.role.team === Team.MAFIA).length;
  const caughtMafia = stats.mafiaEliminated;

  const getWinnerTeamName = () => {
    if (stats.winnerTeam === Team.TOWN) {
      return isRtl ? 'أهل القرية' : 'TOWN TEAM';
    }
    return isRtl ? 'المافيا' : 'MAFIA TEAM';
  };

  return (
    <div 
      className="w-full max-w-lg mx-auto px-4 py-8 text-slate-100 font-sans min-h-[500px] flex flex-col justify-between fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 bg-[#1E293B] border border-slate-750 p-6 rounded-[32px] shadow-2xl">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-md">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
          <Award className={`absolute -bottom-1 ${isRtl ? '-left-1' : '-right-1'} w-6 h-6 text-yellow-500 fill-yellow-500`} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold">
            {isRtl ? 'تهانينا الحارة للاعبين' : 'CONGRATULATIONS'}
          </p>
          <h1 
            className="text-4xl font-black tracking-tight uppercase mt-2 bg-clip-text text-transparent bg-gradient-to-r font-display"
            style={{ 
              backgroundImage: stats.winnerTeam === Team.TOWN 
                ? 'linear-gradient(to right, #3b82f6, #10b981)' 
                : 'linear-gradient(to right, #ef4444, #f59e0b)' 
            }}
          >
            {isRtl ? `انتصر ${getWinnerTeamName()}!` : `${getWinnerTeamName()} WINS!`}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
            {stats.winnerTeam === Team.TOWN 
              ? (isRtl ? 'نجح أهل القرية الشرفاء في استئصال شأفة المؤامرة بنجاح!' : 'The citizens successfully root out the conspiracy!') 
              : (isRtl ? 'أحكم أفراد المافيا قبضتهم الحديدية وسيطروا على القرية بالكامل!' : 'The Mafia successfully takes full control of the town!')}
          </p>
        </div>
      </div>

      {/* 2. Key Statistics Block */}
      <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl my-6 grid grid-cols-3 gap-3 text-center shadow-lg">
        <div className="bg-[#0A0F1D] rounded-xl p-3 shadow-inner">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            {isRtl ? 'الجولات' : 'Rounds'}
          </p>
          <p className="text-xl font-black text-slate-100 mt-1 font-display">{stats.roundsPlayed}</p>
        </div>
        <div className="bg-[#0A0F1D] rounded-xl p-3 shadow-inner">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            {isRtl ? 'الأحياء' : 'Survivors'}
          </p>
          <p className="text-xl font-black text-slate-100 mt-1 font-display">{stats.totalAliveAtEnd}</p>
        </div>
        <div className="bg-[#0A0F1D] rounded-xl p-3 shadow-inner">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            {isRtl ? 'صيد المافيا' : 'Mafia Caught'}
          </p>
          <p className="text-xl font-black mt-1 font-display" style={{ color: caughtMafia === totalMafia ? '#10b981' : '#f59e0b' }}>
            {caughtMafia}/{totalMafia}
          </p>
        </div>
      </div>

      {/* 3. True Identities Revealed List */}
      <div className="space-y-2 bg-[#1E293B] border border-slate-750 p-5 rounded-2xl shadow-lg">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1 font-bold">
          {isRtl ? 'الهويات الحقيقية لجميع اللاعبين' : 'TRUE PLAYER IDENTITIES'}
        </p>
        
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {players.map(p => {
            const isAlive = p.isAlive;
            const roleName = getLocalizedRoleDetails(p.role.type, language).name;
            return (
              <div 
                key={p.id} 
                className={`p-3 rounded-xl border flex items-center justify-between ${isAlive ? 'bg-[#0A0F1D] border-slate-800' : 'bg-[#0A0F1D]/50 border-slate-800/40 opacity-60'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${isAlive ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                  {!isAlive && <span className="text-[9px] text-red-500 font-mono italic font-bold">
                    {isRtl ? '(ميت)' : '(Dead)'}
                  </span>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-md border"
                    style={{ 
                      backgroundColor: `${p.role.color}10`, 
                      borderColor: `${p.role.color}30`, 
                      color: p.role.color 
                    }}
                  >
                    {roleName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reusable Ad Slot for End Game Screen */}
      <div className="my-4">
        <AdPlaceholder position="victory" />
      </div>

      {/* 4. Action Controls */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => { sfx.playClick(); onPlayAgain(); }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-sm tracking-wider font-mono"
        >
          <RefreshCw className="w-4 h-4" /> {isRtl ? 'العب مجدداً' : 'Play Again'}
        </button>
        
        <button
          onClick={() => { sfx.playClick(); onGoHome(); }}
          className="w-full bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-slate-300 font-extrabold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-mono"
        >
          <Home className="w-4 h-4" /> {isRtl ? 'العودة للرئيسية' : 'Return to Main Menu'}
        </button>
      </div>

    </div>
  );
};
