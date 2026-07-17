/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RoleType {
  CITIZEN = 'CITIZEN',
  MAFIA = 'MAFIA',
  DOCTOR = 'DOCTOR',
  DETECTIVE = 'DETECTIVE'
}

export enum Team {
  TOWN = 'TOWN',
  MAFIA = 'MAFIA'
}

export interface Role {
  type: RoleType;
  name: string;
  description: string;
  objective: string;
  team: Team;
  color: string;
  icon: string;
  priority: number;
  hasNightAbility: boolean;
}

export enum GamePhase {
  LANDING = 'LANDING',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  SETUP = 'SETUP',
  REVEAL = 'REVEAL',
  NIGHT = 'NIGHT',
  MORNING = 'MORNING',
  DISCUSSION = 'DISCUSSION',
  VOTING = 'VOTING',
  ROLE_REVEAL_PHASE = 'ROLE_REVEAL_PHASE',
  VICTORY = 'VICTORY'
}

export interface Player {
  id: string;
  name: string;
  index: number;
  isAlive: boolean;
  role: Role;
}

export type VotingMode = 'PASS_PLAY' | 'TABLE_MODE';

export interface GameSettings {
  gameName: string;
  playerCount: number;
  playerNames: string[];
  language: 'en' | 'ar';
  discussionTime: number; // in seconds
  votingTime: number; // in seconds
  nightTime: number; // in seconds
  sound: boolean;
  animations: boolean;
  votingMode: VotingMode;
  includeDoctor: boolean;
  includeDetective: boolean;
}

export interface NightActionsState {
  protectedPlayerId: string | null;
  investigatedPlayerId: string | null;
  killedPlayerId: string | null;
}

export interface GameLogEntry {
  id: string;
  round: number;
  message: string;
  timestamp: string;
}

export interface GameStats {
  roundsPlayed: number;
  winnerTeam: Team;
  totalAliveAtEnd: number;
  mafiaEliminated: number;
  townEliminated: number;
}
