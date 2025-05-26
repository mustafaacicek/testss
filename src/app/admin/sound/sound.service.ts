import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SoundResponse, SoundRequest, SoundStatus } from './sound.model';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private apiUrl = `${environment.apiUrl}/admin/sounds`;

  constructor(private http: HttpClient) { }

  /**
   * Get all sounds for the admin's team
   */
  getSounds(): Observable<SoundResponse[]> {
    return this.http.get<SoundResponse[]>(this.apiUrl);
  }

  /**
   * Get sound by ID
   */
  getSoundById(id: number): Observable<SoundResponse> {
    return this.http.get<SoundResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search sounds by title
   */
  searchSounds(title: string): Observable<SoundResponse[]> {
    return this.http.get<SoundResponse[]>(`${this.apiUrl}/search?title=${title}`);
  }

  /**
   * Create a new sound
   */
  createSound(sound: SoundRequest): Observable<SoundResponse> {
    return this.http.post<SoundResponse>(this.apiUrl, sound);
  }

  /**
   * Update an existing sound
   */
  updateSound(id: number, sound: SoundRequest): Observable<SoundResponse> {
    return this.http.put<SoundResponse>(`${this.apiUrl}/${id}`, sound);
  }

  /**
   * Delete a sound
   */
  deleteSound(id: number): Observable<any> {
    // Use responseType: 'text' to handle empty responses properly
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  /**
   * Upload a new sound file
   */
  uploadNewSoundFile(title: string, file: File, imageFile?: File): Observable<SoundResponse> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    return this.http.post<SoundResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Upload a sound file for an existing sound (update with file)
   */
  uploadSoundFile(id: number, file: File): Observable<SoundResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SoundResponse>(`${this.apiUrl}/${id}/upload`, formData);
  }

  /**
   * Upload a sound image file
   */
  uploadSoundImageFile(id: number, file: File): Observable<SoundResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SoundResponse>(`${this.apiUrl}/${id}/upload-image`, formData);
  }

  /**
   * Update sound status
   */
  updateSoundStatus(id: number, status: SoundStatus): Observable<SoundResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.put<SoundResponse>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  /**
   * Update sound position
   */
  updateSoundPosition(id: number, millisecond: number): Observable<SoundResponse> {
    const params = new HttpParams().set('millisecond', millisecond.toString());
    return this.http.put<SoundResponse>(`${this.apiUrl}/${id}/position`, null, { params });
  }
}
