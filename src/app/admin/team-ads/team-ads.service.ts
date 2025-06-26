import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdPosition, AdType, TeamAd, TeamAdRequest } from './team-ad.model';

@Injectable({
  providedIn: 'root'
})
export class TeamAdsService {
  private baseUrl = `${environment.apiUrl}/admin/team-ads`;

  constructor(private http: HttpClient) { }

  /**
   * Tüm takım reklamlarını getirir
   * @returns Takım reklamları listesi
   */
  getAllTeamAds(): Observable<TeamAd[]> {
    return this.http.get<TeamAd[]>(this.baseUrl);
  }

  /**
   * ID'ye göre takım reklamı getirir
   * @param id Reklamın ID'si
   * @returns Takım reklamı
   */
  getTeamAdById(id: number): Observable<TeamAd> {
    return this.http.get<TeamAd>(`${this.baseUrl}/${id}`);
  }

  /**
   * Yeni takım reklamı oluşturur
   * @param teamAdRequest Reklam bilgileri
   * @returns Oluşturulan takım reklamı
   */
  createTeamAd(teamAdRequest: TeamAdRequest): Observable<TeamAd> {
    return this.http.post<TeamAd>(this.baseUrl, teamAdRequest);
  }

  /**
   * Takım reklamını günceller
   * @param id Reklamın ID'si
   * @param teamAdRequest Güncellenmiş reklam bilgileri
   * @returns Güncellenen takım reklamı
   */
  updateTeamAd(id: number, teamAdRequest: TeamAdRequest): Observable<TeamAd> {
    return this.http.put<TeamAd>(`${this.baseUrl}/${id}`, teamAdRequest);
  }

  /**
   * Takım reklamını siler
   * @param id Reklamın ID'si
   * @returns Silme işlemi sonucu
   */
  deleteTeamAd(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Aktif takım reklamlarını getirir
   * @returns Aktif takım reklamları listesi
   */
  getActiveTeamAds(): Observable<TeamAd[]> {
    return this.http.get<TeamAd[]>(`${this.baseUrl}/active`);
  }

  /**
   * Reklam pozisyonlarını getirir
   * @returns Reklam pozisyonları listesi
   */
  getAdPositions(): Observable<AdPosition[]> {
    return this.http.get<AdPosition[]>(`${this.baseUrl}/positions`);
  }

  /**
   * Reklam tiplerini getirir
   * @returns Reklam tipleri listesi
   */
  getAdTypes(): Observable<AdType[]> {
    return this.http.get<AdType[]>(`${this.baseUrl}/types`);
  }

  /**
   * Takım reklamı durumunu değiştirir
   * @param id Reklamın ID'si
   * @param isActive Aktiflik durumu
   * @returns Güncellenen takım reklamı
   */
  changeTeamAdStatus(id: number, isActive: boolean): Observable<TeamAd> {
    const params = new HttpParams().set('isActive', isActive.toString());
    return this.http.put<TeamAd>(`${this.baseUrl}/${id}/status`, null, { params });
  }
}
