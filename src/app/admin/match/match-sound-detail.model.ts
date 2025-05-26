export enum EventType {
  START = 'START',
  STOP = 'STOP',
  RESUME = 'RESUME',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK = 'SEEK'
}

export enum SoundStatus {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

export interface MatchSoundDetailResponse {
  id: number;
  matchId: number;
  matchName: string;
  activeSoundId: number;
  activeSoundTitle: string;
  activeSoundUrl: string;
  currentMillisecond: number;
  soundStatus: SoundStatus;
  eventType: EventType;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSoundDetailRequest {
  matchId: number;
  soundId: number;
  eventType: EventType;
  soundStatus: SoundStatus;
  currentMillisecond: number;
}

export interface MatchSoundResponse {
  id: number;
  title: string;
  soundUrl: string;
  soundImageUrl: string | null;
  team: {
    id: number;
    name: string;
  };
  status: string;
  currentMillisecond: number;
  updatedAt: string;
}
