import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  MatchSoundDetailResponse, 
  MatchSoundDetailRequest, 
  MatchSoundResponse,
  EventType,
  SoundStatus
} from './match-sound-detail.model';

@Injectable({
  providedIn: 'root'
})
export class MatchSoundDetailService {
  private apiUrl = `${environment.apiUrl}/admin/match-sound-details`;

  constructor(private http: HttpClient) { }

  /**
   * Get all match sound details for admin's team
   * @returns Observable of MatchSoundDetailResponse[]
   */
  getAllMatchSoundDetails(): Observable<MatchSoundDetailResponse[]> {
    return this.http.get<MatchSoundDetailResponse[]>(this.apiUrl);
  }

  /**
   * Get match sound detail by ID
   * @param id The ID of the match sound detail
   * @returns Observable of MatchSoundDetailResponse
   */
  getMatchSoundDetailById(id: number): Observable<MatchSoundDetailResponse> {
    return this.http.get<MatchSoundDetailResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all match sound details for a specific match
   * @param matchId The ID of the match
   * @returns Observable of MatchSoundDetailResponse[]
   */
  getMatchSoundDetailsByMatchId(matchId: number): Observable<MatchSoundDetailResponse[]> {
    return this.http.get<MatchSoundDetailResponse[]>(`${this.apiUrl}/match/${matchId}`);
  }

  /**
   * Get latest match sound detail for a specific match
   * @param matchId The ID of the match
   * @returns Observable of MatchSoundDetailResponse
   */
  getLatestMatchSoundDetail(matchId: number): Observable<MatchSoundDetailResponse> {
    return this.http.get<MatchSoundDetailResponse>(`${this.apiUrl}/match/${matchId}/latest`);
  }

  /**
   * Create a new match sound detail
   * @param matchSoundDetail The match sound detail to create
   * @returns Observable of MatchSoundDetailResponse
   */
  createMatchSoundDetail(matchSoundDetail: MatchSoundDetailRequest): Observable<MatchSoundDetailResponse> {
    return this.http.post<MatchSoundDetailResponse>(this.apiUrl, matchSoundDetail);
  }

  /**
   * Get available sounds for a match
   * @param matchId The ID of the match
   * @returns Observable of MatchSoundResponse[]
   */
  getAvailableSounds(matchId: number): Observable<MatchSoundResponse[]> {
    return this.http.get<MatchSoundResponse[]>(`${this.apiUrl}/match/${matchId}/sounds`);
  }

  /**
   * Update sound status for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @param status The new status of the sound
   * @returns Observable of MatchSoundDetailResponse
   */
  updateSoundStatus(matchId: number, soundId: number, status: SoundStatus): Observable<MatchSoundDetailResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.put<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/status`, 
      {}, 
      { params }
    );
  }

  /**
   * Update sound position for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @param millisecond The new position of the sound in milliseconds
   * @returns Observable of MatchSoundDetailResponse
   */
  updateSoundPosition(matchId: number, soundId: number, millisecond: number): Observable<MatchSoundDetailResponse> {
    const params = new HttpParams().set('millisecond', millisecond.toString());
    return this.http.put<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/position`, 
      {}, 
      { params }
    );
  }

  /**
   * Start playing a sound for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @returns Observable of MatchSoundDetailResponse
   */
  startSound(matchId: number, soundId: number): Observable<MatchSoundDetailResponse> {
    return this.http.post<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/start`, 
      {}
    );
  }

  /**
   * Stop playing a sound for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @returns Observable of MatchSoundDetailResponse
   */
  stopSound(matchId: number, soundId: number): Observable<MatchSoundDetailResponse> {
    return this.http.post<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/stop`, 
      {}
    );
  }

  /**
   * Resume playing a sound for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @returns Observable of MatchSoundDetailResponse
   */
  resumeSound(matchId: number, soundId: number): Observable<MatchSoundDetailResponse> {
    return this.http.post<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/resume`, 
      {}
    );
  }

  /**
   * Pause playing a sound for a match
   * @param matchId The ID of the match
   * @param soundId The ID of the sound
   * @returns Observable of MatchSoundDetailResponse
   */
  pauseSound(matchId: number, soundId: number): Observable<MatchSoundDetailResponse> {
    return this.http.post<MatchSoundDetailResponse>(
      `${this.apiUrl}/match/${matchId}/sound/${soundId}/pause`, 
      {}
    );
  }
}
