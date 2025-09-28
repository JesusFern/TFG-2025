import { apiRequest } from './api';

export interface TipoArquetipo {
  tipo: string;
  nombre: string;
  descripcion: string;
  caloriasObjetivo: number;
}

export interface CrearDietaDesdeTemplateDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  asignadaA: string;
  tipoArquetipo: string;
  horasComidas: string[];
  nombreComidas: string[];
}

export interface CrearDietaDesdeExistenteDTO {
  nombre: string;
  descripcion?: string;
  tipo: string[];
  duracion: number;
  comidasDiarias: number;
  fechaInicio: string;
  asignadaA: string;
  dietaOrigenId: string;
  horasComidas: string[];
  nombreComidas: string[];
}

export const dietTemplateService = {
  // Obtener tipos de arquetipo disponibles
  async obtenerTiposArquetipo(): Promise<{ success: boolean; data: TipoArquetipo[] }> {
    console.log('🔍 Debug dietTemplateService - Obteniendo tipos de arquetipo');
    const response = await apiRequest('/api/diets/templates/arquetipos', {
      method: 'GET'
    });
    
    console.log('🔍 Debug dietTemplateService - Respuesta:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error('🔍 Debug dietTemplateService - Error response:', errorText);
      throw new Error(`Error al obtener tipos de arquetipo: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  },

  // Obtener información de un tipo de arquetipo específico
  async obtenerInfoArquetipo(tipo: string): Promise<{ success: boolean; data: TipoArquetipo }> {
    const response = await apiRequest(`/api/diets/templates/arquetipos/${tipo}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener información del arquetipo');
    }
    
    return await response.json();
  },

  // Crear dieta desde plantilla
  async crearDietaDesdeTemplate(datos: CrearDietaDesdeTemplateDTO): Promise<{ success: boolean; data: unknown; message: string }> {
    const response = await apiRequest('/api/diets/templates/create', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear dieta desde plantilla');
    }
    
    return await response.json();
  },

  // Crear dieta desde dieta existente
  async crearDietaDesdeExistente(datos: CrearDietaDesdeExistenteDTO): Promise<{ success: boolean; data: unknown; message: string }> {
    const response = await apiRequest('/api/diets/copy/copy', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear dieta desde existente');
    }
    
    return await response.json();
  }
};
