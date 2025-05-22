import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamResponse, TeamRequest } from './team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/superadmin/teams`;

  constructor(private http: HttpClient) { }

  /**
   * Get all teams
   */
  getTeams(): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(this.apiUrl);
  }

  /**
   * Get team by ID
   */
  getTeamById(id: number): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search teams by name
   */
  searchTeams(query: string): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(`${this.apiUrl}/search?name=${query}`);
  }

  /**
   * Create a new team
   */
  createTeam(team: TeamRequest): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(this.apiUrl, team);
  }

  /**
   * Update an existing team
   */
  updateTeam(id: number, team: TeamRequest): Observable<TeamResponse> {
    return this.http.put<TeamResponse>(`${this.apiUrl}/${id}`, team);
  }

  /**
   * Delete a team
   */
  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get teams by country ID
   */
  getTeamsByCountry(countryId: number): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(`${this.apiUrl}/by-country/${countryId}`);
  }

  /**
   * Get teams by active status
   */
  getTeamsByStatus(active: boolean): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(`${this.apiUrl}/by-status?active=${active}`);
  }
}
