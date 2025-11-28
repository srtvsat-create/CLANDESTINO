export enum UserRole {
  ADMIN = 'Administrador',
  COLLECTOR = 'Coletor',
  VIEWER = 'Observador'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: number;
  lastAccess?: number;
}

export interface PhotoEntry {
  id: string;
  url: string; // Base64 or Blob URL
  timestamp: number;
  userId: string;
  description?: string;
  tags: string[];
  // New vehicle specific fields
  vehicleModel?: string;
  licensePlate?: string;
  location?: string;
}

export interface AppState {
  users: User[];
  photos: PhotoEntry[];
  currentUser: User | null;
}

export type ReportType = 'daily' | 'weekly' | 'monthly';