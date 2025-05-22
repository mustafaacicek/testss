import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionTypeResponse, SubscriptionTypeRequest, SubscriptionTypeDropdown } from './subscription-type.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionTypeService {
  private apiUrl = `${environment.apiUrl}/superadmin/subscription-types`;

  constructor(private http: HttpClient) { }

  /**
   * Get all subscription types
   */
  getSubscriptionTypes(): Observable<SubscriptionTypeResponse[]> {
    return this.http.get<SubscriptionTypeResponse[]>(this.apiUrl);
  }

  /**
   * Get subscription type by ID
   */
  getSubscriptionTypeById(id: number): Observable<SubscriptionTypeResponse> {
    return this.http.get<SubscriptionTypeResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search subscription types by name
   */
  searchSubscriptionTypes(query: string): Observable<SubscriptionTypeResponse[]> {
    return this.http.get<SubscriptionTypeResponse[]>(`${this.apiUrl}/search?name=${query}`);
  }

  /**
   * Create a new subscription type
   */
  createSubscriptionType(subscriptionType: SubscriptionTypeRequest): Observable<SubscriptionTypeResponse> {
    return this.http.post<SubscriptionTypeResponse>(this.apiUrl, subscriptionType);
  }

  /**
   * Update an existing subscription type
   */
  updateSubscriptionType(id: number, subscriptionType: SubscriptionTypeRequest): Observable<SubscriptionTypeResponse> {
    return this.http.put<SubscriptionTypeResponse>(`${this.apiUrl}/${id}`, subscriptionType);
  }

  /**
   * Delete a subscription type
   */
  deleteSubscriptionType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get subscription types by active status
   */
  getSubscriptionTypesByStatus(active: boolean): Observable<SubscriptionTypeResponse[]> {
    return this.http.get<SubscriptionTypeResponse[]>(`${this.apiUrl}/by-status?active=${active}`);
  }

  /**
   * Get subscription types for dropdown
   */
  getSubscriptionTypesForDropdown(): Observable<SubscriptionTypeDropdown[]> {
    return this.http.get<SubscriptionTypeDropdown[]>(`${this.apiUrl}/dropdown`);
  }
}
