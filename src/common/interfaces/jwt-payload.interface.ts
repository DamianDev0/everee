export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}
