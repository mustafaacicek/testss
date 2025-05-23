import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Match, 
  MatchResponse, 
  MatchRequest, 
  MatchStatus, 
  MatchStatusUpdateRequest, 
  MatchScoreUpdateRequest, 
  OpponentTeam 
} from './match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/admin/matches`;

  constructor(private http: HttpClient) { }

  /**
   * Get all matches
   */
  getAllMatches(): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}`);
  }

  /**
   * Get match by ID
   */
  getMatchById(id: number): Observable<MatchResponse> {
    return this.http.get<MatchResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new match
   */
  createMatch(match: MatchRequest): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.apiUrl}`, match);
  }

  /**
   * Update a match
   */
  updateMatch(id: number, match: MatchRequest): Observable<MatchResponse> {
    return this.http.put<MatchResponse>(`${this.apiUrl}/${id}`, match);
  }

  /**
   * Delete a match
   */
  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  /**
   * Search matches by opponent name
   */
  searchMatchesByOpponentName(opponentName: string): Observable<MatchResponse[]> {
    const params = new HttpParams().set('opponentName', opponentName);
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get matches by status
   */
  getMatchesByStatus(status: MatchStatus): Observable<MatchResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/by-status`, { params });
  }

  /**
   * Get upcoming matches
   * Retrieves matches with a date after the current date
   */
  getUpcomingMatches(): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/upcoming`);
  }

  /**
   * Get past matches
   * Retrieves matches with a date before the current date
   */
  getPastMatches(): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/past`);
  }

  /**
   * Get available opponents
   * Retrieves all available teams that can be selected as opponents (excluding the admin's team)
   */
  getAvailableOpponents(): Observable<OpponentTeam[]> {
    return this.http.get<OpponentTeam[]>(`${this.apiUrl}/available-opponents`);
  }

  /**
   * Get all match statuses
   * Retrieves all available match statuses
   */
  getMatchStatuses(): Observable<MatchStatus[]> {
    return this.http.get<MatchStatus[]>(`${this.apiUrl}/statuses`);
  }

  /**
   * Update match status
   * Updates the status of a match
   * @param id The ID of the match
   * @param statusUpdate Object containing the new status
   */
  updateMatchStatus(id: number, statusUpdate: MatchStatusUpdateRequest): Observable<MatchResponse> {
    // Use query parameters instead of request body for status update
    const params = new HttpParams().set('status', statusUpdate.status);
    return this.http.put<MatchResponse>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  /**
   * Update match score
   * Updates the score of a match
   * @param id The ID of the match
   * @param scoreUpdate Object containing the new home and away scores
   */
  updateMatchScore(id: number, scoreUpdate: MatchScoreUpdateRequest): Observable<MatchResponse> {
    // Use query parameters instead of request body for score update
    const params = new HttpParams()
      .set('homeScore', scoreUpdate.homeScore.toString())
      .set('awayScore', scoreUpdate.awayScore.toString());
    return this.http.put<MatchResponse>(`${this.apiUrl}/${id}/score`, {}, { params });
  }
}
