import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'secret';

  signToken<T extends string | Buffer | object>(
    payload: T,
    expiresIn = process.env.JWT_EXPIRES_IN || '24h',
  ): string {
    const options: SignOptions = {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.secret, options);
  }

  verifyToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  decodeToken<T = any>(token: string): T | null {
    return jwt.decode(token) as T;
  }
}
