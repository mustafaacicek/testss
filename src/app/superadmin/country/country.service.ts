import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CountryResponse, CountryRequest } from './country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = `${environment.apiUrl}/superadmin/countries`;

  constructor(private http: HttpClient) { }

  /**
   * Get all countries
   */
  getCountries(): Observable<CountryResponse[]> {
    return this.http.get<CountryResponse[]>(this.apiUrl);
  }

  /**
   * Get country by ID
   */
  getCountryById(id: number): Observable<CountryResponse> {
    return this.http.get<CountryResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search countries by query
   */
  searchCountries(query: string): Observable<CountryResponse[]> {
    return this.http.get<CountryResponse[]>(`${this.apiUrl}/search?query=${query}`);
  }

  /**
   * Create a new country
   */
  createCountry(country: CountryRequest): Observable<CountryResponse> {
    return this.http.post<CountryResponse>(this.apiUrl, country);
  }

  /**
   * Update an existing country
   */
  updateCountry(id: number, country: CountryRequest): Observable<CountryResponse> {
    return this.http.put<CountryResponse>(`${this.apiUrl}/${id}`, country);
  }

  /**
   * Delete a country
   */
  deleteCountry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
