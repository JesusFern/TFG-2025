import jwt from 'jsonwebtoken';

export class TokenService {
  private static readonly secret = process.env.JWT_SECRET ?? 'secret';
  private static readonly expiresIn = '1h';

  static generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  static verifyToken(token: string): object | null {
    try {
      console.log('🔍 Debug TokenService - Verificando token con secret:', this.secret);
      console.log('🔍 Debug TokenService - Token a verificar:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, this.secret);
      console.log('🔍 Debug TokenService - Token decodificado exitosamente:', decoded);
      
      return typeof decoded === 'object' && decoded !== null ? decoded : null;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return null;
    }
  }
}