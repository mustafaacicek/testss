import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUserResponse, AdminUserRequest, TeamDropdown } from './admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = `${environment.apiUrl}/superadmin/admin-users`;

  constructor(private http: HttpClient) { }

  /**
   * Get all admin users
   */
  getAdminUsers(): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(this.apiUrl);
  }

  /**
   * Get admin user by ID
   */
  getAdminUserById(id: number): Observable<AdminUserResponse> {
    return this.http.get<AdminUserResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search admin users by username
   */
  searchAdminUsers(query: string): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(`${this.apiUrl}/search?username=${query}`);
  }

  /**
   * Create a new admin user
   */
  createAdminUser(adminUser: AdminUserRequest): Observable<AdminUserResponse> {
    return this.http.post<AdminUserResponse>(this.apiUrl, adminUser);
  }

  /**
   * Update an existing admin user
   */
  updateAdminUser(id: number, adminUser: AdminUserRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.apiUrl}/${id}`, adminUser);
  }

  /**
   * Delete an admin user
   */
  deleteAdminUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get admin users by team ID
   */
  getAdminUsersByTeam(teamId: number): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(`${this.apiUrl}/by-team/${teamId}`);
  }

  /**
   * Get admin users by active status
   */
  getAdminUsersByStatus(active: boolean): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(`${this.apiUrl}/by-status?active=${active}`);
  }

  /**
   * Get teams for dropdown
   */
  getTeamsForDropdown(): Observable<TeamDropdown[]> {
    return this.http.get<TeamDropdown[]>(`${this.apiUrl}/teams-dropdown`);
  }
}
