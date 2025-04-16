import bcrypt from 'bcrypt';

export class PasswordService {
  private static readonly saltRounds = 10;

  // Método para encriptar contraseñas
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Método para comparar contraseñas
  static async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}