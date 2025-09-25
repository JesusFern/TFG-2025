import { apiRequest } from './api';
import { Ingrediente } from '../types/diets';

export interface CrearRecetaDTO {
  nombreReceta: string;
  ingredientes: Ingrediente[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  publica: boolean;
}

export interface RecetaResponse {
  _id: string;
  nombreReceta: string;
  ingredientes: Ingrediente[] | string[]; // Compatibilidad con formato anterior
  pasosPreparacion: string[];
  tiempoPreparacion: string;
  imagenes: string[];
  creador?: string;
  publica: boolean;
  informacionNutricional?: string; // Información nutricional calculada
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiRecetaResponse {
  message: string;
  receta: RecetaResponse;
}

export interface RecetasListResponse {
  recetas: RecetaResponse[];
}

// Función auxiliar para construir FormData
const construirFormDataReceta = (
  recetaData: CrearRecetaDTO, 
  imagenes?: File[], 
  imagenesAEliminar?: string[]
): FormData => {
  const formData = new FormData();
  
  if (recetaData.nombreReceta) {
    formData.append('nombreReceta', recetaData.nombreReceta);
  }
  if (recetaData.publica !== undefined) {
    formData.append('publica', recetaData.publica.toString());
  }
  
  if (recetaData.ingredientes) {
    recetaData.ingredientes.forEach((ingrediente, index) => {
      // Transformar ingrediente para el backend
      const ingredienteTransformado = {
        nombre: ingrediente.nombre,
        peso: ingrediente.peso,
        informacionNutricional: {
          calorias: typeof ingrediente.informacionNutricional.calorias === 'string' 
            ? parseFloat(ingrediente.informacionNutricional.calorias) || 0 
            : ingrediente.informacionNutricional.calorias,
          proteinas: typeof ingrediente.informacionNutricional.proteinas === 'string' 
            ? parseFloat(ingrediente.informacionNutricional.proteinas) || 0 
            : ingrediente.informacionNutricional.proteinas,
          carbohidratos: typeof ingrediente.informacionNutricional.carbohidratos === 'string' 
            ? parseFloat(ingrediente.informacionNutricional.carbohidratos) || 0 
            : ingrediente.informacionNutricional.carbohidratos,
          grasas: typeof ingrediente.informacionNutricional.grasas === 'string' 
            ? parseFloat(ingrediente.informacionNutricional.grasas) || 0 
            : ingrediente.informacionNutricional.grasas,
          fibra: ingrediente.informacionNutricional.fibra,
          azucares: ingrediente.informacionNutricional.azucares,
          sal: ingrediente.informacionNutricional.sal,
          sodio: ingrediente.informacionNutricional.sodio
        },
        marca: ingrediente.marca,
        id: ingrediente.id || (ingrediente.codigoBarras && !ingrediente.imagenIngrediente ? ingrediente.codigoBarras : null), // Solo usar codigoBarras si NO es de OpenFoodFacts
        imagenIngrediente: ingrediente.imagenIngrediente,
        fuente: ingrediente.fuente
      };
      
      formData.append(`ingredientes[${index}]`, JSON.stringify(ingredienteTransformado));
    });
  }
  
  // Agregar pasos de preparación si existen
  if (recetaData.pasosPreparacion && recetaData.pasosPreparacion.length > 0) {
    recetaData.pasosPreparacion.forEach((paso, index) => {
      formData.append(`pasosPreparacion[${index}]`, paso);
    });
  }
  
  // Agregar campos opcionales
  if (recetaData.tiempoPreparacion) {
    formData.append('tiempoPreparacion', recetaData.tiempoPreparacion);
  }
  
  // Agregar imágenes si existen
  if (imagenes && imagenes.length > 0) {
    imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen);
    });
  }
  
  if (imagenesAEliminar && imagenesAEliminar.length > 0) {
    imagenesAEliminar.forEach((imagen, index) => {
      formData.append(`imagenesAEliminar[${index}]`, imagen);
    });
  }
  
  return formData;
};

export const crearReceta = async (recetaData: CrearRecetaDTO, imagenes?: File[]): Promise<ApiRecetaResponse> => {
  try {
    console.log('Enviando datos al backend:', JSON.stringify(recetaData, null, 2));
    
    const formData = construirFormDataReceta(recetaData, imagenes);
    
    // Usar apiRequest que ahora maneja FormData correctamente
    const response = await apiRequest('/api/recetas', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la receta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al crear la receta:', error);
    throw error;
  }
};

export const obtenerRecetas = async (): Promise<RecetasListResponse> => {
  try {
    const response = await apiRequest('/api/recetas');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las recetas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener las recetas:', error);
    throw error;
  }
};

export const obtenerRecetasPublicas = async (): Promise<RecetasListResponse> => {
  try {
    const response = await apiRequest('/api/recetas/publicas');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las recetas públicas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener las recetas públicas:', error);
    throw error;
  }
};

export const obtenerMisRecetas = async (): Promise<RecetasListResponse> => {
  try {
    const response = await apiRequest('/api/recetas/mis-recetas');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener mis recetas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mis recetas:', error);
    throw error;
  }
};

export const obtenerRecetasPublicasYPropias = async (): Promise<RecetasListResponse> => {
  try {
    const response = await apiRequest('/api/recetas/publicas-y-propias');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las recetas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener las recetas:', error);
    throw error;
  }
};

export const obtenerReceta = async (recetaId: string): Promise<RecetaResponse> => {
  try {
    const response = await apiRequest(`/api/recetas/${recetaId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la receta');
    }
    
    const data = await response.json();
    return data.receta;
  } catch (error) {
    console.error('Error al obtener la receta:', error);
    throw error;
  }
};

export const actualizarReceta = async (recetaId: string, recetaData: CrearRecetaDTO, imagenes?: File[], imagenesAEliminar?: string[]): Promise<ApiRecetaResponse> => {
  try {
    console.log('Enviando datos para actualizar receta:', JSON.stringify(recetaData, null, 2));
    
    const formData = construirFormDataReceta(recetaData, imagenes, imagenesAEliminar);
    
    const response = await apiRequest(`/api/recetas/${recetaId}`, {
      method: 'PUT',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la receta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar la receta:', error);
    throw error;
  }
};

export const eliminarReceta = async (recetaId: string): Promise<{ message: string; receta: RecetaResponse }> => {
  try {
    const response = await apiRequest(`/api/recetas/${recetaId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la receta');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al eliminar la receta:', error);
    throw error;
  }
};

export const limpiarImagenesHuerfanas = async (): Promise<{
  message: string;
  imagenesEliminadas: number;
  imagenesEncontradas: number;
  imagenesHuerfanas: string[];
}> => {
  try {
    const response = await apiRequest('/api/recetas/limpiar-imagenes-huerfanas', {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al limpiar imágenes huérfanas');
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al limpiar imágenes huérfanas:', error);
    throw error;
  }
};