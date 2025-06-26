/**
 * Takım reklamları için model tanımlamaları
 */

/**
 * Reklam pozisyonu enum değerleri
 */
export enum AdPosition {
  TOP_BANNER = 'TOP_BANNER',
  BOTTOM_BANNER = 'BOTTOM_BANNER'
}

/**
 * Reklam tipi enum değerleri
 */
export enum AdType {
  BANNER = 'BANNER',
  VIDEO = 'VIDEO',
  POPUP = 'POPUP',
  SPONSOR = 'SPONSOR'
}

/**
 * Takım reklamı veri modeli
 */
export interface TeamAd {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  displayOrder: number;
  isActive: boolean;
  teamId: number;
  teamName: string;
  startDate: string;
  endDate: string;
  adPosition: AdPosition;
  adType: AdType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Takım reklamı oluşturma/güncelleme isteği modeli
 */
export interface TeamAdRequest {
  title: string;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  adPosition: AdPosition;
  adType: AdType;
}
