export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  metadata?: any;
}

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: User | null;
  session?: any;
  error?: string;
}
