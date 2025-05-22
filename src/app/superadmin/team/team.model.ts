export interface Team {
  id?: number;
  name: string;
  logoUrl?: string;
  stadiumName: string;
  stadiumLocation: string;
  countryId: number;
  countryName?: string;
  subscriptionTypeId?: number;
  subscriptionTypeName?: string;
  createdById?: number;
  createdByUsername?: string;
  isActive?: boolean;
  subscriptionStart?: string;
  subscriptionExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamResponse {
  id: number;
  name: string;
  logoUrl: string;
  stadiumName: string;
  stadiumLocation: string;
  countryId: number;
  countryName: string;
  subscriptionTypeId: number;
  subscriptionTypeName: string;
  createdById: number;
  createdByUsername: string;
  isActive: boolean;
  subscriptionStart: string;
  subscriptionExpiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRequest {
  name: string;
  logoUrl?: string;
  stadiumName: string;
  stadiumLocation: string;
  countryId: number;
  subscriptionTypeId?: number;
  isActive?: boolean;
}

export interface SubscriptionType {
  id: number;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
}
