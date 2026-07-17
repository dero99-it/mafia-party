/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GamePhase, Player, GameSettings, RoleType, Team, 
  Role, NightActionsState, GameLogEntry, GameStats 
} from './types';
import { sfx } from './utils/audio';
import { generateThemedNames } from './utils/names';
import { translations, getLocalizedRoleDetails } from './utils/translations';

// Subcomponents
import { HowToPlay } from './components/game/HowToPlay';
import { SetupScreen } from './components/game/SetupScreen';
import { RevealScreen } from './components/game/RevealScreen';
import { NightScreen } from './components/game/NightScreen';
import { DayScreen } from './components/game/DayScreen';
import { VoteScreen } from './components/game/VoteScreen';
import { RevealPhaseScreen } from './components/game/RevealPhaseScreen';
import { VictoryScreen } from './components/game/VictoryScreen';
import { AdPlaceholder } from './components/ads/AdPlaceholder';
import { GameBackground } from './components/game/GameBackground';

// Icons
import { 
  Skull, Shield, Search, Users, Play, BookOpen, Volume2, 
  VolumeX, Sparkles, AlertCircle, Settings, Home, RefreshCw, Languages 
} from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  gameName: '',
  playerCount: 6,
  playerNames: [], // auto generated on setup open
  language: 'en',
  discussionTime: 180,
  votingTime: 60,
  nightTime: 30,
  sound: true,
  animations: true,
  votingMode: 'PASS_PLAY',
  includeDoctor: true,
  includeDetective: true
};

const CITIZEN_ROLE: Role = {
  type: RoleType.CITIZEN,
  name: 'Citizen',
  description: 'Has no active night operations. Your job is to use speech, body language, and vote patterns to find the secret Mafia.',
  objective: 'Find and vote out all Mafia members during the Day discussions.',
  team: Team.TOWN,
  color: '#3B82F6', // Blue
  icon: 'Users',
  priority: 99,
  hasNightAbility: false
};

const MAFIA_ROLE: Role = {
  type: RoleType.MAFIA,
  name: 'Mafia',
  description: 'You wake up at the end of every night. Select one player to assassinate in secret.',
  objective: 'Outnumber or equal the remaining Town members through night kills and day deception.',
  team: Team.MAFIA,
  color: '#EF4444', // Red
  icon: 'Skull',
  priority: 3,
  hasNightAbility: true
};

const DOCTOR_ROLE: Role = {
  type: RoleType.DOCTOR,
  name: 'Doctor',
  description: 'You act first at night. Choose one player to protect. If they are targeted by the Mafia, they will survive.',
  objective: 'Keep valuable Town members alive while working with others to vote out the Mafia.',
  team: Team.TOWN,
  color: '#10B981', // Green
  icon: 'Shield',
  priority: 1,
  hasNightAbility: true
};

const DETECTIVE_ROLE: Role = {
  type: RoleType.DETECTIVE,
  name: 'Detective',
  description: 'You act second at night. Choose one player to investigate. The engine reveals if they are Town or Mafia.',
  objective: 'Secretly uncover Mafia identities and steer the Town votes without fully exposing your role.',
  team: Team.TOWN,
  color: '#F59E0B', // Amber
  icon: 'Search',
  priority: 2,
  hasNightAbility: true
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LANDING);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Voted out player state for RevealPhaseScreen
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);

  // Settings & Confirmation Modal Flags
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [confirmQuitOpen, setConfirmQuitOpen] = useState(false);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);

  // Turn variables
  const [lastNightActions, setLastNightActions] = useState<NightActionsState>({
    protectedPlayerId: null,
    investigatedPlayerId: null,
    killedPlayerId: null
  });
  
  const [victoryStats, setVictoryStats] = useState<GameStats | null>(null);

  // FAQ Expand state helper
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const isRtl = settings.language === 'ar';
  const t = translations[settings.language];

  // Sync sound setting initially
  useEffect(() => {
    sfx.setEnabled(soundEnabled);
  }, []);

  // Setup Name auto generator
  const handleStartSetup = () => {
    sfx.playClick();
    const count = settings.playerCount;
    const initialNames = generateThemedNames(count);
    
    setSettings(prev => ({
      ...prev,
      playerNames: initialNames
    }));
    setPhase(GamePhase.SETUP);
  };

  const toggleSoundMain = () => {
    sfx.playClick();
    const val = !soundEnabled;
    sfx.setEnabled(val);
    setSoundEnabled(val);
    setSettings(prev => ({ ...prev, sound: val }));
  };

  // Assign roles based on automatic balanced pools
  const handleStartGame = (configuredSettings: GameSettings) => {
    setSettings(configuredSettings);
    
    const count = configuredSettings.playerCount;
    const names = configuredSettings.playerNames;
    const { includeDoctor, includeDetective } = configuredSettings;

    // Build role pool
    let roles: Role[] = [];
    let mafiaCount = 1;
    let docCount = 0;
    let detCount = 0;

    // 1. Calculate Mafia count
    if (count === 4 || count === 5) {
      mafiaCount = 1;
    } else if (count >= 6 && count <= 8) {
      mafiaCount = 2;
    } else {
      mafiaCount = Math.max(1, Math.floor(count * 0.25));
    }

    // 2. Decide Doctor and Detective based on toggles & playerCount
    if (includeDoctor && includeDetective) {
      if (count >= 4) {
        docCount = 1;
      }
      if (count >= 5) {
        detCount = 1;
      }
    } else if (includeDoctor) {
      if (count >= 4) {
        docCount = 1;
      }
    } else if (includeDetective) {
      if (count >= 4) {
        detCount = 1;
      }
    } else {
      docCount = 0;
      detCount = 0;
    }

    const citizenCount = Math.max(0, count - mafiaCount - docCount - detCount);

    // Add roles to list
    for (let i = 0; i < mafiaCount; i++) roles.push({ ...MAFIA_ROLE });
    for (let i = 0; i < docCount; i++) roles.push({ ...DOCTOR_ROLE });
    for (let i = 0; i < detCount; i++) roles.push({ ...DETECTIVE_ROLE });
    for (let i = 0; i < citizenCount; i++) roles.push({ ...CITIZEN_ROLE });

    // Shuffle roles
    const shuffledRoles = [...roles];
    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
    }

    // Build player array
    const assignedPlayers: Player[] = names.map((name, index) => ({
      id: `player-${index}-${Date.now()}`,
      name: name || `Player ${index + 1}`,
      index,
      isAlive: true,
      role: { ...shuffledRoles[index] }
    }));

    setPlayers(assignedPlayers);
    setRound(1);
    setLogs([
      {
        id: `log-start-${Date.now()}`,
        round: 1,
        message: configuredSettings.language === 'ar' 
          ? `🎮 بدأت اللعبة بوجود ${count} لاعبين. جاري تمرير الهاتف لكشف الأدوار السرية!`
          : `🎮 Game initialized with ${count} players. Pass & Play Role Reveal starts!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
    setPhase(GamePhase.REVEAL);
  };

  // Complete reveal, move to first night!
  const handleFinishReveal = () => {
    sfx.playClick();
    addGameLog(settings.language === 'ar'
      ? `🌙 يرخي الليل سدوله على القرية. يغلق الجميع عيونهم، وتبدأ الأفعال السرية لأصحاب الأدوار الحساسة.`
      : `🌙 Night falls on the town. Everyone closes their eyes. Active roles act in secret!`
    );
    setPhase(GamePhase.NIGHT);
  };

  // Complete night action resolutions
  const handleFinishNight = (actions: NightActionsState, detLogs: string[]) => {
    setLastNightActions(actions);
    
    const victimId = actions.killedPlayerId;
    const protectorId = actions.protectedPlayerId;
    
    // Add Detective logs to history if any occurred
    detLogs.forEach(dl => {
      addGameLog(dl);
    });

    const isSaved = victimId && victimId === protectorId;
    const actualDeathId = isSaved ? null : victimId;

    // Update player status list
    let updatedPlayers = [...players];
    let deadName = '';
    let deadRoleNameEn = '';
    let deadRoleType = RoleType.CITIZEN;

    if (actualDeathId) {
      updatedPlayers = players.map(p => {
        if (p.id === actualDeathId) {
          deadName = p.name;
          deadRoleNameEn = p.role.name;
          deadRoleType = p.role.type;
          return { ...p, isAlive: false };
        }
        return p;
      });
      setPlayers(updatedPlayers);
    }

    const deadRoleNameLoc = deadPlayerRole(deadRoleType);

    // Add log entry
    if (actualDeathId) {
      addGameLog(settings.language === 'ar'
        ? `💀 الصباح: وُجِد ${deadName} مقتولاً البارحة. دوره الحقيقي كان: ${deadRoleNameLoc}.`
        : `💀 Morning: ${deadName} was found dead last night. Their true role was: ${deadRoleNameEn}.`
      );
    } else if (isSaved) {
      addGameLog(settings.language === 'ar'
        ? `❤️ الصباح: حاول أفراد المافيا تصفية أحد اللاعبين ولكن تدخل الطبيب أنقذه بالكامل! لا وفيات الليلة.`
        : `❤️ Morning: Someone was attacked by the Mafia but saved by the Doctor! No deaths tonight.`
      );
    } else {
      addGameLog(settings.language === 'ar'
        ? `🕊️ الصباح: مرت ليلة هادئة للغاية. لم تسجل أي وفيات أو أحداث الليلة.`
        : `🕊️ Morning: A quiet night. No casualties were recorded.`
      );
    }

    // Run Win check
    if (checkVictoryConditions(updatedPlayers)) {
      return; // Victory screen handled inside condition checker
    }

    // Proceed to Day discussion
    setPhase(GamePhase.DISCUSSION);
  };

  const deadPlayerRole = (type: RoleType) => {
    return getLocalizedRoleDetails(type, settings.language).name;
  };

  const handleStartVoting = () => {
    setPhase(GamePhase.VOTING);
  };

  // Process Voting result
  const handleFinishVoting = (eliminatedPlayerId: string | null, votingTally: Record<string, string>) => {
    let updatedPlayers = [...players];
    let bannerMsg = '';

    // Record logs of voting pattern
    let voteText = settings.language === 'ar' ? '🗳️ تفصيل فرز الأصوات: ' : '🗳️ Day Vote Tally: ';
    const entries = Object.entries(votingTally);
    entries.forEach(([voterId, targetId]) => {
      const voter = players.find(p => p.id === voterId);
      const target = players.find(p => p.id === targetId);
      if (voter) {
        voteText += `${voter.name}➔${target ? target.name : (settings.language === 'ar' ? 'تخطي' : 'Skip')}; `;
      }
    });
    addGameLog(voteText);

    let eliminatedObj: Player | null = null;

    if (eliminatedPlayerId) {
      updatedPlayers = players.map(p => {
        if (p.id === eliminatedPlayerId) {
          eliminatedObj = p;
          const locRole = getLocalizedRoleDetails(p.role.type, settings.language).name;
          bannerMsg = settings.language === 'ar'
            ? `تم نفي اللاعب ${p.name} بأغلبية الأصوات! دوره الحقيقي كان: ${locRole}.`
            : `${p.name} was banished by majority vote! Their true role was ${p.role.name}.`;
          return { ...p, isAlive: false };
        }
        return p;
      });
      setPlayers(updatedPlayers);
      setEliminatedPlayer(eliminatedObj);
      addGameLog(settings.language === 'ar' ? `⚖️ نفي وتصويت: ${bannerMsg}` : `⚖️ Banished: ${bannerMsg}`);
    } else {
      setEliminatedPlayer(null);
      bannerMsg = settings.language === 'ar'
        ? `حدث تعادل أو امتنع أغلبية اللاعبين! لم يُنفَ أي شخص اليوم.`
        : `A tie or skip majority occurred! Nobody is banished today.`;
      addGameLog(settings.language === 'ar' ? `⚖️ تصويت: ${bannerMsg}` : `⚖️ Voting: ${bannerMsg}`);
    }

    // Update last night values for next cycle
    setLastNightActions({
      protectedPlayerId: null,
      investigatedPlayerId: null,
      killedPlayerId: null
    });

    // Advance to ROLE_REVEAL_PHASE for dramatic feedback
    setPhase(GamePhase.ROLE_REVEAL_PHASE);
  };

  // Continues game loop after the Banishment/Tie reveal
  const handleContinueFromRevealPhase = () => {
    sfx.playClick();
    
    // Check Win
    if (checkVictoryConditions(players)) {
      return;
    }

    // Advance round and return to Night phase
    setRound(prev => prev + 1);
    addGameLog(settings.language === 'ar'
      ? `🌙 يرخي الليل سدوله من جديد (الليلة ${round + 1}). يغلق الجميع عيونهم.`
      : `🌙 Night ${round + 1} falls. Everyone closes their eyes.`
    );
    setPhase(GamePhase.NIGHT);
  };

  // CORE GAME WIN LOGIC
  const checkVictoryConditions = (activePlayerList: Player[]) => {
    const alive = activePlayerList.filter(p => p.isAlive);
    const mafiaCount = alive.filter(p => p.role.team === Team.MAFIA).length;
    const townCount = alive.filter(p => p.role.team === Team.TOWN).length;

    // Victory Team checks
    let winner: Team | null = null;
    if (mafiaCount === 0) {
      winner = Team.TOWN;
    } else if (mafiaCount >= townCount) {
      winner = Team.MAFIA;
    }

    if (winner) {
      // Game ended! Assemble statistics
      const startingMafia = players.filter(p => p.role.team === Team.MAFIA).length;
      const startingTown = players.filter(p => p.role.team === Team.TOWN).length;

      const endingAliveMafia = alive.filter(p => p.role.team === Team.MAFIA).length;
      const endingAliveTown = alive.filter(p => p.role.team === Team.TOWN).length;

      setVictoryStats({
        roundsPlayed: round,
        winnerTeam: winner,
        totalAliveAtEnd: alive.length,
        mafiaEliminated: startingMafia - endingAliveMafia,
        townEliminated: startingTown - endingAliveTown
      });

      const winnerTextLoc = winner === Team.TOWN
        ? (settings.language === 'ar' ? 'فريق أهل القرية' : 'Town Team')
        : (settings.language === 'ar' ? 'فريق المافيا' : 'Mafia Team');

      addGameLog(settings.language === 'ar'
        ? `🏆 انتهت المباراة بالكامل! انتصر ${winnerTextLoc} باللقب!`
        : `🏆 Game Over! ${winner === Team.TOWN ? 'Town' : 'Mafia'} Team wins the match!`
      );
      setPhase(GamePhase.VICTORY);
      return true;
    }
    return false;
  };

  const addGameLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        round,
        message,
        timestamp
      }
    ]);
  };

  // Re-start setup for a fresh game
  const handlePlayAgain = () => {
    sfx.playClick();
    handleStartGame(settings);
  };

  const handleGoHome = () => {
    sfx.playClick();
    setPhase(GamePhase.LANDING);
  };

  // Helper for Top Bar Game Phase Title
  const getPhaseTitle = () => {
    switch (phase) {
      case GamePhase.REVEAL:
        return settings.language === 'ar' ? 'توزيع الأدوار' : 'Role Distribution';
      case GamePhase.NIGHT:
        return settings.language === 'ar' ? `الليل ${round}` : `Night ${round}`;
      case GamePhase.DISCUSSION:
        return settings.language === 'ar' ? `النهار ${round}` : `Day ${round}`;
      case GamePhase.VOTING:
        return settings.language === 'ar' ? `التصويت ${round}` : `Vote ${round}`;
      case GamePhase.ROLE_REVEAL_PHASE:
        return settings.language === 'ar' ? 'كشف الدور' : 'Role Reveal';
      default:
        return '';
    }
  };

  const isGameActive = [
    GamePhase.REVEAL, 
    GamePhase.NIGHT, 
    GamePhase.DISCUSSION, 
    GamePhase.VOTING, 
    GamePhase.ROLE_REVEAL_PHASE
  ].includes(phase);

  return (
    <div 
      className={`min-h-screen bg-transparent text-slate-100 flex flex-col justify-between selection:bg-blue-600/30 font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <GameBackground />
      
      {/* ⚙️ GLOBAL TOP BAR FOR RUNNING GAMES */}
      {isGameActive && (
        <header className="bg-[#0A0F1D]/90 border-b border-slate-800/80 px-4 py-3.5 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between">
          {/* Back/Home & Settings buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sfx.playClick(); setConfirmQuitOpen(true); }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={settings.language === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => { sfx.playClick(); setIsOptionsOpen(true); }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={settings.language === 'ar' ? 'الإعدادات والخيارات' : 'Options & Settings'}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Phase & Round title */}
          <div className="text-center">
            <p className="text-[10px] font-mono tracking-wider text-slate-500 font-bold uppercase">{settings.language === 'ar' ? 'المرحلة النشطة' : 'ACTIVE PHASE'}</p>
            <h2 className="text-base font-black text-white font-display mt-0.5">{getPhaseTitle()}</h2>
          </div>

          {/* Sound & Reset controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSoundMain}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              onClick={() => { sfx.playClick(); setConfirmRestartOpen(true); }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title={settings.language === 'ar' ? 'إعادة تشغيل اللعبة' : 'Restart Match'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* 🏠 LANDING PAGE VIEW */}
      {phase === GamePhase.LANDING && (
        <div className="flex flex-col flex-1 max-w-[1200px] mx-auto w-full border-x border-slate-850 bg-[#090F1E]/80 backdrop-blur-md shadow-2xl fade-in">
          {/* Main Navigation Bar */}
          <header className="flex items-center justify-between px-6 py-5 md:px-10 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EF4444] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <span className="text-2xl font-black italic text-white select-none">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white select-none">
                MAFIA <span className="text-[#EF4444]">{settings.language === 'ar' ? 'بارتي' : 'PARTY'}</span>
              </span>
            </div>
            
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
              <button 
                onClick={() => { sfx.playClick(); setPhase(GamePhase.HOW_TO_PLAY); }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t.rules}
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Selector in Header */}
              <button
                onClick={() => {
                  sfx.playClick();
                  const nextLang = settings.language === 'en' ? 'ar' : 'en';
                  setSettings(prev => ({ ...prev, language: nextLang }));
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-xs text-slate-300 font-bold transition-all cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                <span>{settings.language === 'en' ? 'العربية' : 'English'}</span>
              </button>

              <button
                onClick={toggleSoundMain}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute Game' : 'Unmute Game'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
              </button>
              <div className="h-4 w-[1px] bg-slate-800"></div>
              <span className="text-xs text-slate-500 font-mono">V1.0.0</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col divide-y divide-slate-850">
            {/* 1. HERO SECTION (WITH SIDEBAR AD ON DESKTOP) */}
            <section className="px-6 py-10 md:px-10 lg:py-16">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between">
                
                {/* Desktop Left Ad (160x600) / Mobile Stacks */}
                <div className="shrink-0">
                  <AdPlaceholder position="hero" />
                </div>

                {/* Hero Core Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center w-full py-6">
                  <div className="space-y-6 animate-fade-in flex-1 max-w-2xl flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase font-mono">
                        {isRtl ? 'نمط مرر والعب (جهاز واحد)' : 'One Device Mode (Pass & Play)'}
                      </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] font-display text-white">
                      {isRtl ? <>العَب مافيا<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 underline decoration-slate-800 font-sans">خلال دقيقة واحدة!</span></> : <>PLAY MAFIA<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 underline decoration-slate-800">IN 60 SECONDS.</span></>}
                    </h1>
                    
                    <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium max-w-xl mx-auto">
                      {isRtl 
                        ? 'بدون تحميل. بدون تسجيل حساب. العب فوراً مع أصدقائك بوضع تمرير الهاتف سرياً للمجموعات من 4 إلى 20 لاعباً.'
                        : 'No downloads. No registration. No setup friction. The perfect offline party companion for groups of 4-20 players.'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 pt-2">
                      <button 
                        onClick={handleStartSetup}
                        className="px-8 py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transform active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="text-base uppercase">{isRtl ? 'ابدأ اللعب الآن' : 'Start Game'}</span>
                        <Play className="w-5 h-5 fill-white animate-pulse" />
                      </button>
                      
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <div className="flex -space-x-3">
                          <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-[#EF4444] flex items-center justify-center text-xs font-bold" title="Mafia">🕵️</div>
                          <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-[#10B981] flex items-center justify-center text-xs font-bold" title="Doctor">🩺</div>
                          <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-[#3B82F6] flex items-center justify-center text-xs font-bold" title="Detective">🔍</div>
                          <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-200">+17</div>
                        </div>
                        <span className="text-xs text-slate-500 font-mono ml-1">{isRtl ? 'الأدوار جاهزة' : 'Roles Ready'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. HOW TO PLAY SECTION (STEPS 1-4 IN GRID) */}
            <section className="px-6 py-12 md:px-10 bg-[#0A0F1D]/40">
              <div className="text-center space-y-3 mb-10">
                <p className="text-xs font-bold text-blue-500 tracking-widest font-mono uppercase">
                  {isRtl ? 'طريقة اللعب البسيطة' : 'THE CORE SYSTEM'}
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display">
                  {isRtl ? 'كيف تلعب مافيا بارتي؟' : 'How To Play'}
                </h2>
                <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {/* Step 1 */}
                <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all text-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">STEP 1</span>
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isRtl ? 'اجمع أصدقاءك' : 'Gather Friends'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {isRtl ? '٤ إلى ٢٠ لاعباً حول هاتف ذكي واحد في الغرفة.' : 'Gather 4-20 players around a single smartphone in the room.'}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all text-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">STEP 2</span>
                      <span className="text-2xl">🎭</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isRtl ? 'وزّع الأدوار سراً' : 'Assign Roles'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {isRtl ? 'يتم تمرير الهاتف بالتوالي، ويكشف كل لاعب دوره سراً بآلية الضغط المطول.' : 'The phone is passed sequentially. Each player views their secret role using a secure hold.'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all text-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">STEP 3</span>
                      <span className="text-2xl">🌙</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isRtl ? 'أفعال الليل السرية' : 'Night Phase'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {isRtl ? 'يغمض الجميع أعينهم. المافيا يغتالون، الطبيب يحمي، والمحقق يتقصى.' : 'Everyone closes their eyes. Mafia assassinates, Doctor protects, and Detective investigates.'}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all text-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">STEP 4</span>
                      <span className="text-2xl">🗳️</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isRtl ? 'النقاش والتصويت' : 'Vote & Eliminate'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {isRtl ? 'يستيقظ الجميع نهاراً للمناقشة، ثم يتم التصويت سراً أو علناً لطرد المشتبهين.' : 'Wake up in morning, discuss suspects under timer, and vote to eliminate a player.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Learn More Button */}
              <div className="text-center pt-8">
                <button
                  onClick={() => { sfx.playClick(); setPhase(GamePhase.HOW_TO_PLAY); }}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-900/40 hover:border-blue-400 px-5 py-3 rounded-xl cursor-pointer transition-all uppercase tracking-wider font-mono"
                >
                  <span>{isRtl ? 'اعرف أكثر بالتفصيل ←' : 'Learn More / Rules →'}</span>
                </button>
              </div>
            </section>

            {/* 3. FEATURES SECTION (WITH SIDEBAR AD ON DESKTOP) */}
            <section className="px-6 py-12 md:px-10">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between">
                
                {/* Desktop Left Ad (160x600) / Mobile Stacks */}
                <div className="shrink-0">
                  <AdPlaceholder position="features" />
                </div>

                {/* Features Content */}
                <div className="flex-1 w-full space-y-8 lg:pl-4">
                  <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs font-bold text-[#EF4444] tracking-widest font-mono uppercase">
                      {isRtl ? 'ميزات اللعبة الفاخرة' : 'UNRIVALED CRAFTSMANSHIP'}
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-tight font-display">
                      {t.featuresTitle}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auto-Balance */}
                    <div className="bg-[#1E293B]/50 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                      <span className="text-xl">⚖️</span>
                      <h4 className="font-bold text-white text-sm">{t.feature1Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t.feature1Desc}
                      </p>
                    </div>

                    {/* Pass & Play */}
                    <div className="bg-[#1E293B]/50 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                      <span className="text-xl">📱</span>
                      <h4 className="font-bold text-white text-sm">{t.feature2Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t.feature2Desc}
                      </p>
                    </div>

                    {/* Smart Defaults */}
                    <div className="bg-[#1E293B]/50 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                      <span className="text-xl">🤖</span>
                      <h4 className="font-bold text-white text-sm">{t.feature3Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t.feature3Desc}
                      </p>
                    </div>

                    {/* Dual Language */}
                    <div className="bg-[#1E293B]/50 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                      <span className="text-xl">🌐</span>
                      <h4 className="font-bold text-white text-sm">{t.feature4Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t.feature4Desc}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 4. FAQ SECTION */}
            <section className="px-6 py-12 md:px-10 bg-[#0A0F1D]/40">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2 mb-4">
                  <p className="text-xs font-bold text-amber-400 tracking-widest font-mono uppercase">
                    {isRtl ? 'الأجوبة السريعة' : 'HAVE QUESTIONS?'}
                  </p>
                  <h2 className="text-3xl font-black text-white tracking-tight font-display">
                    {t.faqTitle}
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* FAQ 1 */}
                  <div className="bg-[#1E293B]/50 border border-slate-800 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => { sfx.playClick(); setActiveFaqIndex(activeFaqIndex === 0 ? null : 0); }}
                      className={`w-full flex justify-between items-center p-4 text-sm font-bold text-slate-200 hover:text-white transition-colors cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <span>{t.faq1Quest}</span>
                      <span className="text-red-400 text-lg font-mono">{activeFaqIndex === 0 ? '−' : '+'}</span>
                    </button>
                    {activeFaqIndex === 0 && (
                      <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                        {t.faq1Ans}
                      </div>
                    )}
                  </div>

                  {/* FAQ 2 */}
                  <div className="bg-[#1E293B]/50 border border-slate-800 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => { sfx.playClick(); setActiveFaqIndex(activeFaqIndex === 1 ? null : 1); }}
                      className={`w-full flex justify-between items-center p-4 text-sm font-bold text-slate-200 hover:text-white transition-colors cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <span>{t.faq2Quest}</span>
                      <span className="text-emerald-400 text-lg font-mono">{activeFaqIndex === 1 ? '−' : '+'}</span>
                    </button>
                    {activeFaqIndex === 1 && (
                      <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                        {t.faq2Ans}
                      </div>
                    )}
                  </div>

                  {/* FAQ 3 */}
                  <div className="bg-[#1E293B]/50 border border-slate-800 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => { sfx.playClick(); setActiveFaqIndex(activeFaqIndex === 2 ? null : 2); }}
                      className={`w-full flex justify-between items-center p-4 text-sm font-bold text-slate-200 hover:text-white transition-colors cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <span>{t.faq3Quest}</span>
                      <span className="text-blue-400 text-lg font-mono">{activeFaqIndex === 2 ? '−' : '+'}</span>
                    </button>
                    {activeFaqIndex === 2 && (
                      <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                        {t.faq3Ans}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="px-6 py-4 md:px-12 md:py-5 bg-[#0A0F1D] border-t border-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[10px] text-slate-500 tracking-wide font-mono uppercase">
              {isRtl ? '© ٢٠٢٦ مافيا بارتي • تجربة ألعاب جماعية عصرية' : '© 2026 MAFIA PARTY • MODERN GAMING EXPERIENCE'}
            </p>
            <div className="flex gap-6">
              <button onClick={() => { sfx.playClick(); setPhase(GamePhase.HOW_TO_PLAY); }} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer uppercase font-mono">{t.rules}</button>
              <a href="https://ai.studio/build" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-mono">{isRtl ? 'تصدير' : 'EXPORT'}</a>
            </div>
          </footer>
        </div>
      )}

      {/* 📖 HOW TO PLAY GUIDANCE VIEW */}
      {phase === GamePhase.HOW_TO_PLAY && (
        <HowToPlay 
          onBack={() => setPhase(GamePhase.LANDING)} 
          language={settings.language}
        />
      )}

      {/* ⚙️ GAME SETUP CONFIGURATION VIEW */}
      {phase === GamePhase.SETUP && (
        <SetupScreen 
          initialSettings={settings} 
          onStartGame={handleStartGame}
          onBack={() => setPhase(GamePhase.LANDING)}
        />
      )}

      {/* 🎭 PASS & PLAY ROLE REVEAL FLOW */}
      {phase === GamePhase.REVEAL && (
        <RevealScreen 
          players={players} 
          onFinishReveal={handleFinishReveal} 
          language={settings.language}
        />
      )}

      {/* 🌙 SECRET NIGHT COVERT MOVES */}
      {phase === GamePhase.NIGHT && (
        <NightScreen 
          players={players} 
          onFinishNight={handleFinishNight} 
          language={settings.language}
        />
      )}

      {/* ☀️ MORNING OUTCOME & DAY DISCUSSION PANEL */}
      {phase === GamePhase.DISCUSSION && (
        <DayScreen
          round={round}
          players={players}
          discussionTime={settings.discussionTime}
          killedPlayerId={lastNightActions.killedPlayerId}
          protectedPlayerId={lastNightActions.protectedPlayerId}
          logs={logs}
          onStartVoting={handleStartVoting}
          language={settings.language}
        />
      )}

      {/* 🗳️ VOTING RESOLUTION (PASS PHONE OR TABLE VIEW) */}
      {phase === GamePhase.VOTING && (
        <VoteScreen
          players={players}
          votingMode={settings.votingMode}
          onFinishVoting={handleFinishVoting}
          language={settings.language}
        />
      )}

      {/* 🎭 DRAMATIC BANISHMENT ROLE REVEAL PHASE */}
      {phase === GamePhase.ROLE_REVEAL_PHASE && (
        <RevealPhaseScreen
          eliminatedPlayer={eliminatedPlayer}
          onContinue={handleContinueFromRevealPhase}
          language={settings.language}
        />
      )}

      {/* 🏆 VICTORY SCORECARD PANEL */}
      {phase === GamePhase.VICTORY && victoryStats && (
        <VictoryScreen
          stats={victoryStats}
          players={players}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          language={settings.language}
        />
      )}

      {/* ================= OPTIONAL DIALOGS & OVERLAYS ================= */}

      {/* ⚙️ GAME OPTIONS & SETTINGS DIALOG */}
      {isOptionsOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <div className="w-full max-w-sm bg-[#1E293B] border border-slate-750 p-6 rounded-[24px] shadow-2xl space-y-5 animate-fade-in text-center">
            {/* Title */}
            <div className="flex items-center gap-2 justify-center pb-2 border-b border-slate-800">
              <Settings className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-black text-white font-display">
                {isRtl ? 'خيارات وإعدادات اللعبة' : 'Game Options & Settings'}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3 text-left">
              {/* Language Selection */}
              <div className="flex items-center justify-between bg-[#0A0F1D] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">{isRtl ? 'لغة اللعبة:' : 'Game Language:'}</span>
                <button
                  onClick={() => {
                    sfx.playClick();
                    const nextLang = settings.language === 'en' ? 'ar' : 'en';
                    setSettings(prev => ({ ...prev, language: nextLang }));
                  }}
                  className="px-3 py-1.5 bg-[#1E293B] border border-slate-700 hover:bg-slate-800 text-xs font-extrabold rounded-lg text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5 text-blue-400" />
                  <span>{settings.language === 'en' ? 'العربية' : 'English'}</span>
                </button>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between bg-[#0A0F1D] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">{isRtl ? 'المؤثرات الصوتية:' : 'Sound Effects:'}</span>
                <button
                  onClick={toggleSoundMain}
                  className="px-3 py-1.5 bg-[#1E293B] border border-slate-700 hover:bg-slate-800 text-xs font-extrabold rounded-lg text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
                  <span>{soundEnabled ? (isRtl ? 'مفعّلة' : 'Enabled') : (isRtl ? 'مكتومة' : 'Muted')}</span>
                </button>
              </div>

              {/* Animations Toggle */}
              <div className="flex items-center justify-between bg-[#0A0F1D] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">{isRtl ? 'المؤثرات البصرية:' : 'Visual Effects:'}</span>
                <button
                  onClick={() => {
                    sfx.playClick();
                    setSettings(prev => ({ ...prev, animations: !prev.animations }));
                  }}
                  className="px-3 py-1.5 bg-[#1E293B] border border-slate-700 hover:bg-slate-800 text-xs font-extrabold rounded-lg text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${settings.animations ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>{settings.animations ? (isRtl ? 'مفعّلة' : 'On') : (isRtl ? 'معطّلة' : 'Off')}</span>
                </button>
              </div>

              {/* Timer & Settings Stats */}
              <div className="bg-[#0A0F1D] p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  {isRtl ? 'مواصفات المؤقت النشط' : 'Active Timers Info'}
                </p>
                <div className={`flex justify-between text-xs text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{isRtl ? 'وقت النقاش العلني:' : 'Discussion Time:'}</span>
                  <span className="font-mono font-bold text-slate-200">{settings.discussionTime}s</span>
                </div>
                <div className={`flex justify-between text-xs text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{isRtl ? 'نمط تصويت النهار:' : 'Day Voting Mode:'}</span>
                  <span className="font-bold text-slate-200">
                    {settings.votingMode === 'PASS_PLAY' 
                      ? (isRtl ? 'مرر والعب (سري)' : 'Pass & Play') 
                      : (isRtl ? 'تصويت الطاولة العلني' : 'Table Tally')}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Options Button */}
            <div className="pt-2">
              <button
                onClick={() => { sfx.playClick(); setIsOptionsOpen(false); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-mono"
              >
                {isRtl ? 'العودة وإكمال اللعب' : 'Close & Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏠 QUIT CONFIRMATION DIALOG (HOME BUTTON) */}
      {confirmQuitOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <div className="w-full max-w-sm bg-[#1E293B] border border-red-900/30 p-6 rounded-[24px] shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                {isRtl ? 'هل تريد إنهاء اللعبة؟' : 'Quit Current Match?'}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                {isRtl 
                  ? 'هل أنت متأكد من رغبتك في الخروج والعودة للرئيسية؟ ستفقد كامل تقدم اللعبة الحالي.'
                  : 'Are you sure you want to exit to the main menu? Your active game state will be lost.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { sfx.playClick(); setConfirmQuitOpen(false); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase font-mono tracking-wider"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setConfirmQuitOpen(false);
                  setIsOptionsOpen(false);
                  setPhase(GamePhase.LANDING);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase font-mono tracking-wider"
              >
                {isRtl ? 'تأكيد الخروج' : 'Confirm Exit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 RESTART CONFIRMATION DIALOG (RESET BUTTON) */}
      {confirmRestartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <div className="w-full max-w-sm bg-[#1E293B] border border-amber-900/30 p-6 rounded-[24px] shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <RefreshCw className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                {isRtl ? 'إعادة بدء جولة جديدة؟' : 'Restart Game?'}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                {isRtl 
                  ? 'سيتم إعادة تعيين وتوزيع جميع الأدوار والبدء من الجولة الأولى مجدداً بأسماء اللاعبين ذاتها.'
                  : 'Are you sure you want to restart? This will reassign roles and start a fresh round.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { sfx.playClick(); setConfirmRestartOpen(false); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase font-mono tracking-wider"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setConfirmRestartOpen(false);
                  setIsOptionsOpen(false);
                  handleStartGame(settings);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase font-mono tracking-wider"
              >
                {isRtl ? 'تأكيد الإعادة' : 'Confirm Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
