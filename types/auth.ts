export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' ;
  // profilePhoto?: string;
  // bio?: string;
  // phone?: string;
  location?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  // confirmpassword: string;
  role?: 'admin' | 'staff' ;
}