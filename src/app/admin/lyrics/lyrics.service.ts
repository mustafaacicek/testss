import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lyrics, LyricsResponse, LyricsRequest } from './lyrics.model';

@Injectable({
  providedIn: 'root'
})
export class LyricsService {
  private apiUrl = `${environment.apiUrl}/admin/lyrics`;

  constructor(private http: HttpClient) { }

  /**
   * Get all lyrics for a sound
   */
  getLyricsForSound(soundId: number): Observable<LyricsResponse[]> {
    return this.http.get<LyricsResponse[]>(`${this.apiUrl}/sound/${soundId}`);
  }

  /**
   * Get lyrics by ID
   */
  getLyricsById(id: number): Observable<LyricsResponse> {
    return this.http.get<LyricsResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a lyric for a sound
   */
  createLyrics(soundId: number, lyrics: LyricsRequest): Observable<LyricsResponse> {
    return this.http.post<LyricsResponse>(`${this.apiUrl}/sound/${soundId}`, lyrics);
  }

  /**
   * Create multiple lyrics for a sound (batch)
   */
  createLyricsBatch(soundId: number, lyrics: LyricsRequest[]): Observable<LyricsResponse[]> {
    return this.http.post<LyricsResponse[]>(`${this.apiUrl}/sound/${soundId}/batch`, lyrics);
  }

  /**
   * Update a lyric
   */
  updateLyrics(id: number, lyrics: LyricsRequest): Observable<LyricsResponse> {
    return this.http.put<LyricsResponse>(`${this.apiUrl}/${id}`, lyrics);
  }

  /**
   * Delete a lyric
   */
  deleteLyrics(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  /**
   * Delete all lyrics for a sound
   */
  deleteAllLyricsForSound(soundId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sound/${soundId}`, { responseType: 'text' });
  }
}
