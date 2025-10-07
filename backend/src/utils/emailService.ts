import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import PasswordResetToken from '../models/users/passwordResetToken';
import { Types } from 'mongoose';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Inicializa el transportador de nodemailer
   */
  private static getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    // Configuración del transportador
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    // Si no hay credenciales configuradas, usar ethereal para desarrollo
    if (!emailUser || !emailPassword) {
      logger.warn('⚠️ No se encontraron credenciales de email. Usando modo de desarrollo (emails no se enviarán).');
      
      // En desarrollo sin credenciales, solo loguear
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      
      return this.transporter;
    }

    // Configurar transporter con credenciales reales
    this.transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      // Configuración adicional para Gmail
      ...(emailService === 'gmail' && {
        secure: true,
        port: 465
      })
    });

    logger.info(`✅ Servicio de email configurado con ${emailService}`);
    return this.transporter;
  }

  /**
   * Envía un email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = this.getTransporter();
      const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nutroos.com';

      const mailOptions = {
        from: `Nutroos <${emailFrom}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      // Si estamos usando el transporte JSON (desarrollo sin credenciales)
      if (
        typeof transporter === 'object' &&
        transporter?.transporter &&
        typeof transporter.transporter === 'object' &&
        transporter.transporter.name === 'JSONTransport'
      ) {
        logger.info('📧 EMAIL (MODO DESARROLLO):');
        logger.info('Para:', options.to);
        logger.info('Asunto:', options.subject);
        logger.info('De:', emailFrom);
        logger.info('----------------------------');
        return;
      }

      // Enviar email real
      const info = await transporter.sendMail(mailOptions);
      
      logger.info('✅ Email enviado exitosamente:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      });
    } catch (error) {
      logger.error('❌ Error al enviar email:', {
        error: error instanceof Error ? error.message : error,
        to: options.to,
        subject: options.subject
      });
      throw new Error('Error al enviar el email. Por favor intenta nuevamente.');
    }
  }

  /**
   * Genera un token de recuperación de contraseña
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea un token de recuperación en la base de datos
   */
  static async createPasswordResetToken(userId: Types.ObjectId): Promise<string> {
    const token = this.generateResetToken();
    
    // Eliminar tokens anteriores del usuario
    await PasswordResetToken.deleteMany({ userId });

    // Crear nuevo token que expira en 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    await PasswordResetToken.create({
      userId,
      token,
      expiresAt
    });

    return token;
  }

  /**
   * Verifica si un token es válido
   */
  static async verifyResetToken(token: string): Promise<Types.ObjectId | null> {
    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return null;
    }

    return resetToken.userId;
  }

  /**
   * Elimina un token de recuperación
   */
  static async deleteResetToken(token: string): Promise<void> {
    await PasswordResetToken.deleteOne({ token });
  }

  /**
   * Envía email de recuperación de contraseña
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #45a049; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nutroos</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Nutroos.</p>
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </p>
            <p>O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en 1 hora</li>
                <li>Si no solicitaste este cambio, puedes ignorar este correo</li>
                <li>Tu contraseña actual seguirá siendo válida</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Nutroos. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Recuperación de Contraseña - Nutroos',
      html
    });
  }
}

