export interface Country {
  id?: number;
  name: string;
  logoUrl?: string;
  shortCode: string;
  description?: string;
  teamCount?: number;
}

export interface CountryResponse {
  id: number;
  name: string;
  logoUrl: string;
  shortCode: string;
  description: string;
  teamCount: number;
}

export interface CountryRequest {
  name: string;
  logoUrl?: string;
  shortCode: string;
  description?: string;
}
