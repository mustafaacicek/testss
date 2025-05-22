export enum SoundStatus {
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  ENDED = 'ENDED'
}

export interface Sound {
  id?: number;
  title: string;
  soundUrl1?: string;
  soundUrl2?: string;
  teamId?: number;
  teamName?: string;
  status?: SoundStatus;
  currentMillisecond?: number;
  updatedAt?: string;
}

export interface SoundResponse {
  id: number;
  title: string;
  soundUrl1: string;
  soundUrl2: string | null;
  teamId: number;
  teamName: string;
  status: SoundStatus;
  currentMillisecond: number;
  updatedAt: string;
}

export interface SoundRequest {
  title: string;
  soundUrl1?: string;
  soundUrl2?: string;
  status?: SoundStatus;
  currentMillisecond?: number;
}

export interface SoundStatusUpdate {
  status: SoundStatus;
}

export interface SoundPositionUpdate {
  currentMillisecond: number;
}
