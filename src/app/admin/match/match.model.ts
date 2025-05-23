/**
 * Match model interfaces
 */

export enum MatchStatus {
  PLANNED = 'PLANNED',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export interface Match {
  id?: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  opponentTeamId?: number | null;
  opponentTeamName?: string | null;
  opponentTeamLogo?: string | null;
  manualOpponentName?: string | null;
  manualOpponentLogo?: string | null;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  createdAt?: string;
}

export interface MatchResponse {
  id: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  opponentTeamId: number | null;
  opponentTeamName: string | null;
  opponentTeamLogo: string | null;
  manualOpponentName: string | null;
  manualOpponentLogo: string | null;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  createdAt: string;
}

export interface MatchRequest {
  opponentTeamId?: number | null;
  manualOpponentName?: string | null;
  manualOpponentLogo?: string | null;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  matchDate: string;
}

export interface MatchStatusUpdateRequest {
  status: MatchStatus;
}

export interface MatchScoreUpdateRequest {
  homeScore: number;
  awayScore: number;
}

export interface OpponentTeam {
  id: number;
  name: string;
  logo: string;
  description?: string;
  active?: boolean;
}
