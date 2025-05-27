import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatchDetailResponse, MatchSoundResponse, SoundControlResponse } from './match-manage.model';

@Injectable({
  providedIn: 'root'
})
export class MatchManageService {
  private apiUrl = `${environment.apiUrl}/admin/match-details`;

  constructor(private http: HttpClient) { }

  /**
   * Get match details including active sound information
   */
  getMatchDetails(matchId: number): Observable<MatchDetailResponse> {
    return this.http.get<MatchDetailResponse>(`${this.apiUrl}/match/${matchId}`);
  }

  /**
   * Get all available sounds for the match's team
   */
  getTeamSounds(matchId: number): Observable<MatchSoundResponse[]> {
    return this.http.get<MatchSoundResponse[]>(`${this.apiUrl}/match/${matchId}/sounds`);
  }

  /**
   * Start playing a sound for the match
   */
  startSound(matchId: number, soundId: number): Observable<SoundControlResponse> {
    return this.http.post<SoundControlResponse>(`${this.apiUrl}/match/${matchId}/sound/${soundId}/start`, {});
  }

  /**
   * Stop the currently playing sound
   */
  stopSound(matchId: number): Observable<SoundControlResponse> {
    return this.http.post<SoundControlResponse>(`${this.apiUrl}/match/${matchId}/sound/stop`, {});
  }

  /**
   * Pause the currently playing sound
   */
  pauseSound(matchId: number): Observable<SoundControlResponse> {
    return this.http.post<SoundControlResponse>(`${this.apiUrl}/match/${matchId}/sound/pause`, {});
  }

  /**
   * Resume the paused sound
   */
  resumeSound(matchId: number): Observable<SoundControlResponse> {
    return this.http.post<SoundControlResponse>(`${this.apiUrl}/match/${matchId}/sound/resume`, {});
  }

  /**
   * Seek to a specific position in the sound
   */
  seekSound(matchId: number, position: number): Observable<SoundControlResponse> {
    const params = new HttpParams().set('position', position.toString());
    return this.http.post<SoundControlResponse>(`${this.apiUrl}/match/${matchId}/sound/seek`, {}, { params });
  }
}
