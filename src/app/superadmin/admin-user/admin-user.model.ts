export interface AdminUser {
  id?: number;
  username: string;
  email: string;
  password?: string;
  roleName?: string;
  teamId: number;
  teamName?: string;
  isActive?: boolean;
  createdById?: number;
  createdByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  email: string;
  roleName: string;
  teamId: number;
  teamName: string;
  isActive: boolean;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRequest {
  username: string;
  email: string;
  password?: string;
  teamId: number;
  isActive?: boolean;
}

export interface TeamDropdown {
  id: number;
  name: string;
  countryName: string;
}
