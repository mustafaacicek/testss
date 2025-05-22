export interface SubscriptionType {
  id?: number;
  name: string;
  maxClients: number;
  maxMatches: number;
  price: number;
  durationDays: number;
  description?: string;
  isActive?: boolean;
  createdById?: number;
  createdByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
  teamsCount?: number;
}

export interface SubscriptionTypeResponse {
  id: number;
  name: string;
  maxClients: number;
  maxMatches: number;
  price: number;
  durationDays: number;
  description: string;
  isActive: boolean;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
  teamsCount: number;
}

export interface SubscriptionTypeRequest {
  name: string;
  maxClients: number;
  maxMatches: number;
  price: number;
  durationDays: number;
  description?: string;
  isActive?: boolean;
}

export interface SubscriptionTypeDropdown {
  id: number;
  name: string;
  price: number;
  durationDays: number;
}
