export enum SoundStatus {
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

export interface ActiveSound {
  id: number;
  title: string;
  soundUrl: string;
  soundImageUrl: string | null;
}

export interface MatchDetailResponse {
  matchId: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  opponentTeamId: number;
  opponentTeamName: string;
  opponentTeamLogo: string;
  manualOpponentName: string | null;
  manualOpponentLogo: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  activeSound: ActiveSound | null;
  soundStatus: SoundStatus | null;
  currentMillisecond: number;
  soundUpdatedAt: string | null;
}

export interface MatchSoundResponse {
  id: number;
  title: string;
  soundUrl: string;
  soundImageUrl: string | null;
  status: string;
  currentMillisecond: number;
}

export interface SoundControlResponse {
  matchId: number;
  activeSound: ActiveSound;
  soundStatus: SoundStatus;
  currentMillisecond: number;
  soundUpdatedAt: string;
}
