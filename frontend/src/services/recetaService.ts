import { apiRequest } from './api';

export interface CrearRecetaDTO {
  nombreReceta: string;
  ingredientes: string[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  informacionNutricional?: string;
  publica: boolean;
}

export interface RecetaResponse {
  _id: string;
  nombreReceta: string;
  ingredientes: string[];
  pasosPreparacion: string[];
  tiempoPreparacion: string;
  informacionNutricional: string;
  imagenes: string[];
  creador?: string;
  publica: boolean;
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

export const crearReceta = async (recetaData: CrearRecetaDTO, imagenes?: File[]): Promise<ApiRecetaResponse> => {
  try {
    console.log('Enviando datos al backend:', JSON.stringify(recetaData, null, 2));
    
    const formData = new FormData();
    
    // Agregar datos de la receta
    formData.append('nombreReceta', recetaData.nombreReceta);
    formData.append('publica', recetaData.publica.toString());
    
    // Agregar ingredientes
    recetaData.ingredientes.forEach((ingrediente, index) => {
      formData.append(`ingredientes[${index}]`, ingrediente);
    });
    
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
    
    if (recetaData.informacionNutricional) {
      formData.append('informacionNutricional', recetaData.informacionNutricional);
    }
    
    // Agregar imágenes si existen
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach((imagen) => {
        formData.append('imagenes', imagen);
      });
    }
    
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
    
    const formData = new FormData();
    
    // Agregar datos de la receta
    if (recetaData.nombreReceta) {
      formData.append('nombreReceta', recetaData.nombreReceta);
    }
    if (recetaData.publica !== undefined) {
      formData.append('publica', recetaData.publica.toString());
    }
    
    // Agregar ingredientes
    if (recetaData.ingredientes) {
      recetaData.ingredientes.forEach((ingrediente, index) => {
        formData.append(`ingredientes[${index}]`, ingrediente);
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
    
    if (recetaData.informacionNutricional) {
      formData.append('informacionNutricional', recetaData.informacionNutricional);
    }
    
    // Agregar imágenes si existen
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach((imagen) => {
        formData.append('imagenes', imagen);
      });
    }
    
    // Agregar imágenes a eliminar si existen
    if (imagenesAEliminar && imagenesAEliminar.length > 0) {
      imagenesAEliminar.forEach((imagen, index) => {
        formData.append(`imagenesAEliminar[${index}]`, imagen);
      });
    }
    
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