export interface AuthUser {
  sub: string;
  role: string;
  fullName: string;
  iat?: number;
  exp?: number;
}
