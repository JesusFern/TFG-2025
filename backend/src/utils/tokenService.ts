import jwt from 'jsonwebtoken';

export class TokenService {
  private static readonly secret = process.env.JWT_SECRET ?? 'secret';
  private static readonly expiresIn = '7d';
  static generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  static verifyToken(token: string): object | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      return typeof decoded === 'object' && decoded !== null ? decoded : null;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return null;
    }
  }
}