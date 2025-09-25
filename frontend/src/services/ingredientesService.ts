import { apiRequest } from './api';
import { AlimentoOpenFoodFacts, Ingrediente } from '../types/diets';
import axios from 'axios';

// Ingrediente local de la base de datos
export interface IngredienteLocal {
  _id: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
  fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  creador?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo unificado para ingredientes (local o OpenFoodFacts)
export type IngredienteUnificado = AlimentoOpenFoodFacts | IngredienteLocal;

export interface BuscarIngredientesResponse {
  message: string;
  alimentos: IngredienteUnificado[];
  paginacion: {
    pagina: number;
    total: number;
    maxResultados: number;
    hayMasResultados: boolean;
  };
  fuentes?: {
    local: number;
    openfoodfacts: number;
    descripcion: {
      local: string;
      openfoodfacts: string;
    };
  };
}

/**
 * Busca ingredientes solo en la base de datos local
 */
export const buscarIngredientesLocales = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 10
): Promise<BuscarIngredientesResponse> => {
  try {
    const params = new URLSearchParams({
      nombre: nombre.trim(),
      page: page.toString(),
      maxResults: maxResults.toString()
    });
    
    const response = await apiRequest(`/api/alimentos/buscar-locales?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar ingredientes locales');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al buscar ingredientes locales:', error);
    throw new Error('Error al buscar ingredientes locales. Inténtalo de nuevo.');
  }
};

/**
 * Busca ingredientes usando el sistema híbrido (local + OpenFoodFacts)
 */
export const buscarIngredientes = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 10
): Promise<BuscarIngredientesResponse> => {
  try {
    const params = new URLSearchParams({
      nombre: nombre.trim(),
      page: page.toString(),
      maxResults: maxResults.toString()
    });
    
    // Usar la nueva API híbrida que prioriza alimentos naturales españoles
    const response = await apiRequest(`/api/alimentos/buscar-hibrido?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar ingredientes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al buscar ingredientes:', error);
    throw new Error('Error al buscar ingredientes. Inténtalo de nuevo.');
  }
};

/**
 * Busca ingredientes solo en OpenFoodFacts (fallback)
 */
export const buscarIngredientesOpenFoodFacts = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 10
): Promise<BuscarIngredientesResponse> => {
  try {
    const params = new URLSearchParams({
      nombre: nombre.trim(),
      page: page.toString(),
      maxResults: maxResults.toString()
    });
    
    const response = await apiRequest(`/api/openfoodfacts/buscar?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar ingredientes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al buscar ingredientes en OpenFoodFacts:', error);
    throw new Error('Error al buscar ingredientes. Inténtalo de nuevo.');
  }
};

/**
 * Obtiene información detallada de un ingrediente por código de barras
 */
export const obtenerIngredientePorCodigo = async (codigo: string): Promise<AlimentoOpenFoodFacts> => {
  try {
    const response = await apiRequest(`/api/openfoodfacts/producto/${codigo}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el ingrediente');
    }
    
    const data = await response.json();
    return data.alimento;
  } catch (error) {
    console.error('Error al obtener ingrediente por código:', error);
    throw new Error('Error al obtener el ingrediente. Inténtalo de nuevo.');
  }
};

/**
 * Verifica la conectividad con todos los servicios de alimentación
 */
export const verificarServicioIngredientes = async (): Promise<boolean> => {
  try {
    const response = await apiRequest('/api/alimentos/verificar-servicios');
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.estado === 'OK';
  } catch (error) {
    console.error('Error al verificar servicios de ingredientes:', error);
    return false;
  }
};

/**
 * Verifica solo el servicio OpenFoodFacts
 */
export const verificarServicioOpenFoodFacts = async (): Promise<boolean> => {
  try {
    const response = await apiRequest('/api/openfoodfacts/verificar');
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.estado === 'OK';
  } catch (error) {
    console.error('Error al verificar servicio OpenFoodFacts:', error);
    return false;
  }
};

/**
 * Guarda un ingrediente de OpenFoodFacts en la base de datos local
 */
export const guardarIngredienteOpenFoodFacts = async (ingrediente: {
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
  marca?: string;
  imagen?: string;
  codigoBarras?: string;
}): Promise<{
  success: boolean;
  ingrediente?: IngredienteLocal;
  message?: string;
  metadata?: {
    nombreOriginal: string;
    nombreModificado: boolean;
    razonModificacion?: string;
  };
}> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.post('/api/ingredientes/guardar-openfoodfacts', ingrediente, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      ingrediente: response.data.ingrediente,
      message: response.data.message,
      metadata: response.data.metadata
    };
  } catch (error) {
    console.error('Error al guardar ingrediente de OpenFoodFacts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al guardar ingrediente'
    };
  }
};

/**
 * Guarda múltiples ingredientes de OpenFoodFacts en la base de datos local
 */
export const guardarIngredientesOpenFoodFacts = async (ingredientes: Ingrediente[]): Promise<{
  success: boolean;
  guardados: number;
  errores: number;
  detalles: Array<{
    ingrediente: string;
    success: boolean;
    message?: string;
  }>;
}> => {
  const resultados = {
    success: true,
    guardados: 0,
    errores: 0,
    detalles: [] as Array<{
      ingrediente: string;
      success: boolean;
      message?: string;
    }>
  };

  // Filtrar solo ingredientes que tienen código de barras (vienen de OpenFoodFacts)
  const ingredientesOpenFF = ingredientes.filter(ing => ing.codigoBarras && !ing.codigoBarras.startsWith('local_'));

  for (const ingrediente of ingredientesOpenFF) {
    try {
      const resultado = await guardarIngredienteOpenFoodFacts({
        nombre: ingrediente.nombre,
        calorias: ingrediente.informacionNutricional.calorias,
        proteinas: ingrediente.informacionNutricional.proteinas,
        grasas: ingrediente.informacionNutricional.grasas,
        hidratosCarbono: ingrediente.informacionNutricional.carbohidratos,
        marca: ingrediente.marca,
        imagen: ingrediente.imagenIngrediente,
        codigoBarras: ingrediente.codigoBarras
      });

      if (resultado.success) {
        resultados.guardados++;
        resultados.detalles.push({
          ingrediente: ingrediente.nombre,
          success: true,
          message: resultado.message
        });
      } else {
        resultados.errores++;
        resultados.detalles.push({
          ingrediente: ingrediente.nombre,
          success: false,
          message: resultado.message
        });
      }
    } catch (error) {
      resultados.errores++;
      resultados.detalles.push({
        ingrediente: ingrediente.nombre,
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  resultados.success = resultados.errores === 0;
  return resultados;
};
