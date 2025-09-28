import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarService {
  private static oauth2Client: OAuth2Client;

  static getOAuthClient(): OAuth2Client {
    if (!this.oauth2Client) {
      const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_API_KEY } = process.env;
      
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
        throw new Error('Faltan variables de entorno de Google Calendar');
      }

      this.oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
      );

      // Configurar API key si está disponible
      if (GOOGLE_API_KEY) {
        this.oauth2Client.apiKey = GOOGLE_API_KEY;
      }
    }

    return this.oauth2Client;
  }

  static getAuthUrl(): string {
    const oauth2Client = this.getOAuthClient();
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar'
      ],
    });
  }

  static async getTokensFromCode(code: string) {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  static async refreshAccessToken(refreshToken: string) {
    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('No se pudo renovar el token de acceso');
    }
  }

  static getCalendarClient(accessToken: string) {
    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  static async getCalendarClientWithRefresh(refreshToken: string) {
    const oauth2Client = this.getOAuthClient();
    
    try {
      // Configurar las credenciales con el refresh token
      oauth2Client.setCredentials({ 
        refresh_token: refreshToken 
      });
      
      // Intentar obtener un nuevo access token usando el refresh token
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Configurar las credenciales actualizadas
      oauth2Client.setCredentials(credentials);
      
      console.log('Token de acceso refrescado exitosamente');
      
      return google.calendar({ 
        version: 'v3', 
        auth: oauth2Client,
        params: {
          key: process.env.GOOGLE_API_KEY
        }
      });
    } catch (error) {
      console.error('Error refrescando token de acceso:', error);
      
      // Si el error es invalid_grant, significa que el refresh token también expiró
      if (error instanceof Error && error.message.includes('invalid_grant')) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      
      throw new Error('No se pudo refrescar el token de acceso. Por favor, reconecta tu Google Calendar.');
    }
  }
}
