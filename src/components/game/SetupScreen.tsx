/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameSettings } from '../../types';
import { generateSimpleNames, generateThemedNames, generateEmojiNames } from '../../utils/names';
import { translations } from '../../utils/translations';
import { AdPlaceholder } from '../ads/AdPlaceholder';
import { sfx } from '../../utils/audio';
import { 
  Users, Settings, Volume2, VolumeX, Sparkles, Languages, 
  Clock, Play, RefreshCw, Check, ArrowLeft 
} from 'lucide-react';

interface SetupScreenProps {
  initialSettings: GameSettings;
  onStartGame: (settings: GameSettings) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ 
  initialSettings, 
  onStartGame,
  onBack
}) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [namingStyle, setNamingStyle] = useState<'simple' | 'themed' | 'emoji'>('themed');

  const t = translations[settings.language];
  const isRtl = settings.language === 'ar';

  // Regenerate names when player count, naming style, or language changes
  useEffect(() => {
    let names: string[] = [];
    if (namingStyle === 'simple') {
      names = generateSimpleNames(settings.playerCount, settings.language);
    } else if (namingStyle === 'themed') {
      names = generateThemedNames(settings.playerCount, settings.language);
    } else if (namingStyle === 'emoji') {
      names = generateEmojiNames(settings.playerCount, settings.language);
    }
    
    setSettings(prev => ({
      ...prev,
      playerNames: names
    }));
  }, [settings.playerCount, namingStyle, settings.language]);

  const handlePlayerCountChange = (newCount: number) => {
    sfx.playClick();
    if (newCount < 4 || newCount > 20) return;
    setSettings(prev => ({
      ...prev,
      playerCount: newCount
    }));
  };

  const handleNameChange = (index: number, name: string) => {
    const updatedNames = [...settings.playerNames];
    updatedNames[index] = name;
    setSettings(prev => ({
      ...prev,
      playerNames: updatedNames
    }));
  };

  const toggleSound = () => {
    sfx.playClick();
    const val = !settings.sound;
    sfx.setEnabled(val);
    setSettings(prev => ({ ...prev, sound: val }));
  };

  const handleStart = () => {
    sfx.playClick();
    onStartGame(settings);
  };

  // Live Auto Role Balance Preview
  const getRoleBalance = (count: number, includeDoctor: boolean, includeDetective: boolean) => {
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
      if (count >= 4) docCount = 1;
      if (count >= 5) detCount = 1;
    } else if (includeDoctor) {
      if (count >= 4) docCount = 1;
    } else if (includeDetective) {
      if (count >= 4) detCount = 1;
    }

    const citizenCount = Math.max(0, count - mafiaCount - docCount - detCount);

    return { mafiaCount, docCount, detCount, citizenCount };
  };

  const { mafiaCount, docCount, detCount, citizenCount } = getRoleBalance(
    settings.playerCount,
    settings.includeDoctor ?? true,
    settings.includeDetective ?? true
  );

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 py-8 text-slate-100 font-sans fade-in"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => { sfx.playClick(); onBack(); }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.backButton}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Settings className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-display text-white">{t.setupTitle}</h1>
        </div>
        <button
          onClick={toggleSound}
          className="text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800 p-2 rounded-lg transition-colors cursor-pointer"
          title={settings.sound ? t.mute : t.unmute}
        >
          {settings.sound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Parameters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic settings and playerCount slider */}
          <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl space-y-4 shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
              <Users className="w-4 h-4 text-blue-400" /> {t.basicSettings}
            </h2>
            
            {/* Optional Game Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">{t.gameNameLabel}</label>
              <input
                type="text"
                value={settings.gameName}
                onChange={e => setSettings({ ...settings, gameName: e.target.value })}
                placeholder={t.gameNamePlaceholder}
                className={`w-full bg-[#0A0F1D] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors text-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* Player Count */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400 font-mono">{t.playerCountLabel}</label>
                <span className="text-lg font-extrabold text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {settings.playerCount} {isRtl ? 'لاعبين' : 'Players'}
                </span>
              </div>
              <div className="flex gap-3 items-center pt-1.5">
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(settings.playerCount - 1)}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-lg font-bold flex items-center justify-center hover:border-slate-600 active:scale-95 transition-all cursor-pointer select-none"
                >
                  −
                </button>
                <input
                  type="range"
                  min="4"
                  max="20"
                  value={settings.playerCount}
                  onChange={e => handlePlayerCountChange(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(settings.playerCount + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-lg font-bold flex items-center justify-center hover:border-slate-600 active:scale-95 transition-all cursor-pointer select-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Active Roles Toggles */}
          <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl space-y-4 shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-[#EF4444]" /> {t.rolesSectionTitle}
            </h2>
            <p className="text-[10px] text-slate-500 leading-tight">
              {t.rolesSectionDesc}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Doctor Toggle */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setSettings(prev => ({ ...prev, includeDoctor: !prev.includeDoctor }));
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${settings.includeDoctor ? 'bg-[#0A0F1D]/60 border-emerald-500/30 text-slate-200 shadow-sm' : 'bg-slate-900/10 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🩺</span>
                  <div>
                    <p className={`text-xs font-bold ${settings.includeDoctor ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {t.doctorToggleName}
                    </p>
                    <p className="text-[9px] text-slate-500">{t.doctorToggleDesc}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${settings.includeDoctor ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'border-slate-700 bg-slate-900/30'}`}>
                  {settings.includeDoctor && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Detective Toggle */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setSettings(prev => ({ ...prev, includeDetective: !prev.includeDetective }));
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${settings.includeDetective ? 'bg-[#0A0F1D]/60 border-amber-500/30 text-slate-200 shadow-sm' : 'bg-slate-900/10 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🕵️</span>
                  <div>
                    <p className={`text-xs font-bold ${settings.includeDetective ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {t.detectiveToggleName}
                    </p>
                    <p className="text-[9px] text-slate-500">{t.detectiveToggleDesc}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${settings.includeDetective ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'border-slate-700 bg-slate-900/30'}`}>
                  {settings.includeDetective && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Real-time Balanced Roles Preview */}
          <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" /> {t.autoRoleBalance}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Citizen Card */}
              <div className="bg-[#0A0F1D]/60 p-3 rounded-xl border border-blue-900/30 text-center">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">{t.citizensCount}</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">{citizenCount}</p>
                <p className="text-[9px] text-slate-500 mt-1">{t.townTeamLabel}</p>
              </div>
              {/* Doctor Card */}
              <div className="bg-[#0A0F1D]/60 p-3 rounded-xl border border-emerald-900/30 text-center">
                <p className={`text-[10px] ${docCount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'} uppercase tracking-wider font-mono`}>{t.doctorToggleName}</p>
                <p className={`text-2xl font-extrabold ${docCount > 0 ? 'text-white' : 'text-slate-600'} mt-1 font-mono`}>{docCount}</p>
                <p className="text-[9px] text-slate-500 mt-1">{docCount > 0 ? t.doctorActionLabel : t.roleDisabledLabel}</p>
              </div>
              {/* Detective Card */}
              <div className="bg-[#0A0F1D]/60 p-3 rounded-xl border border-amber-900/30 text-center">
                <p className={`text-[10px] ${detCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'} uppercase tracking-wider font-mono`}>{t.detectiveToggleName}</p>
                <p className={`text-2xl font-extrabold ${detCount > 0 ? 'text-white' : 'text-slate-600'} mt-1 font-mono`}>{detCount}</p>
                <p className="text-[9px] text-slate-500 mt-1">
                  {detCount > 0 ? t.detectiveActionLabel : (settings.playerCount < 5 && settings.includeDetective) ? t.roleUnusedLabel : t.roleDisabledLabel}
                </p>
              </div>
              {/* Mafia Card */}
              <div className="bg-[#0A0F1D]/60 p-3 rounded-xl border border-red-900/30 text-center">
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider font-mono">{t.mafiaCountLabel}</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">{mafiaCount}</p>
                <p className="text-[9px] text-slate-500 mt-1">{t.mafiaActionLabel}</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-3.5 font-mono">
              {t.nightPriorityLabel}: {settings.includeDoctor && '🛡️ ' + t.doctorToggleName + ' (1) ➔ '} {settings.includeDetective && '🔍 ' + t.detectiveToggleName + ' (2) ➔ '} ☠️ {t.mafiaCountLabel} ({settings.includeDoctor && settings.includeDetective ? '3' : settings.includeDoctor || settings.includeDetective ? '2' : '1'})
            </div>
          </div>

          {/* Timers & Rules */}
          <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl space-y-4 shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-emerald-400" /> {t.timersAndRules}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discussion Timer */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">{t.discussionDuration}</label>
                <select
                  value={settings.discussionTime}
                  onChange={e => setSettings({ ...settings, discussionTime: parseInt(e.target.value) })}
                  className="w-full bg-[#0A0F1D] border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors text-slate-200"
                >
                  <option value={60}>{t.durationMinutes.replace('{{minutes}}', '1')}</option>
                  <option value={120}>{t.durationMinutes.replace('{{minutes}}', '2')}</option>
                  <option value={180}>{t.durationMinutesDefault.replace('{{minutes}}', '3')}</option>
                  <option value={240}>{t.durationMinutes.replace('{{minutes}}', '4')}</option>
                  <option value={300}>{t.durationMinutes.replace('{{minutes}}', '5')}</option>
                </select>
              </div>

              {/* Voting Timer */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">{t.votingDuration}</label>
                <select
                  value={settings.votingTime}
                  onChange={e => setSettings({ ...settings, votingTime: parseInt(e.target.value) })}
                  className="w-full bg-[#0A0F1D] border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors text-slate-200"
                >
                  <option value={30}>{t.durationSeconds.replace('{{seconds}}', '30')}</option>
                  <option value={60}>{t.durationSecondsDefault.replace('{{seconds}}', '60')}</option>
                  <option value={90}>{t.durationSeconds.replace('{{seconds}}', '90')}</option>
                  <option value={120}>{t.durationSeconds.replace('{{seconds}}', '120')}</option>
                </select>
              </div>

              {/* Voting Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">{t.votingModeLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { sfx.playClick(); setSettings({ ...settings, votingMode: 'PASS_PLAY' }); }}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${settings.votingMode === 'PASS_PLAY' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#0A0F1D] border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    🔄 {t.passPlayButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => { sfx.playClick(); setSettings({ ...settings, votingMode: 'TABLE_MODE' }); }}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${settings.votingMode === 'TABLE_MODE' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#0A0F1D] border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    🎲 {t.tableModeButton}
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">{t.languageLabel}</label>
                <select
                  value={settings.language}
                  onChange={e => {
                    sfx.playClick();
                    const nextLang = e.target.value as 'en' | 'ar';
                    setSettings(prev => ({ ...prev, language: nextLang }));
                  }}
                  className="w-full bg-[#0A0F1D] border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors text-slate-200"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Player Names */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1E293B] border border-slate-750 p-5 rounded-2xl flex flex-col h-full max-h-[500px] shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                👥 {t.playerNamesLabel}
              </h2>
              
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  if (namingStyle === 'themed') setNamingStyle('emoji');
                  else if (namingStyle === 'emoji') setNamingStyle('simple');
                  else setNamingStyle('themed');
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-900/60 hover:border-blue-500/50 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                title="Generate funny or themed names"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t.namingStyleLabel}: {namingStyle === 'themed' ? `🎭 ${t.styleThemed}` : namingStyle === 'emoji' ? `🍕 ${t.styleEmoji}` : `🤖 ${t.styleStandard}`}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mb-3 leading-tight">
              {t.playerNamesDesc}
            </p>

            {/* Scrollable Player List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {settings.playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#0A0F1D]/60 border border-slate-800/80 p-2 rounded-xl hover:border-slate-700 transition-colors">
                  <span className={`w-6 text-xs text-slate-500 font-mono ${isRtl ? 'text-left' : 'text-right'}`}>{index + 1}.</span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => handleNameChange(index, e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-xs font-semibold text-slate-200 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Ad spot */}
      <AdPlaceholder position="setup" />

      {/* Primary CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={handleStart}
          className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-blue-950/40 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" /> {t.startPassPlayButton}
        </button>
        <p className="text-xs text-slate-500 mt-2 font-mono">
          {t.startPassPlayDesc}
        </p>
      </div>
    </div>
  );
};
