export interface AuthState {
  authenticated: boolean;
  token: string;
  isRequestInProgress: boolean;
  error?: string;
  user?: any;
}