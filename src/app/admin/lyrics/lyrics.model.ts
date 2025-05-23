/**
 * Lyrics model interfaces
 */

export interface Lyrics {
  id?: number;
  lyric: string;
  second: number;
  soundId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LyricsResponse {
  id: number;
  lyric: string;
  second: number;
  soundId: number;
  createdAt: string;
  updatedAt: string;
}

export interface LyricsRequest {
  lyric: string;
  second: number;
}
