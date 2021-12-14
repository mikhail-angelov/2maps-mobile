
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthParams {
  user: User;
  token: string;
}

export interface AuthState {
  authenticated: boolean;
  token: string;
  isRequestInProgress: boolean;
  error?: string;
  user?: any;
  resetToken: string;
  showAdMob: boolean;
}