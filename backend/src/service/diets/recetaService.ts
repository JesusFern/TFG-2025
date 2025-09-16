import Receta from '../../models/diets/receta';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface CrearRecetaData {
  nombreReceta: string;
  ingredientes: string[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  informacionNutricional?: string;
  imagenes?: string[];
  publica: boolean | string;
  creadorId: string;
}

export async function crearRecetaService(datosReceta: CrearRecetaData) {
  if (typeof datosReceta.publica === 'string') {
    datosReceta.publica = datosReceta.publica === 'true';
  }

  const receta = new Receta({
    nombreReceta: datosReceta.nombreReceta.trim(),
    ingredientes: datosReceta.ingredientes.map(ingrediente => ingrediente.trim()),
    pasosPreparacion: datosReceta.pasosPreparacion?.map(paso => paso.trim()) || [],
    tiempoPreparacion: datosReceta.tiempoPreparacion?.trim() || '',
    informacionNutricional: datosReceta.informacionNutricional?.trim() || '',
    imagenes: datosReceta.imagenes || [],
    publica: datosReceta.publica,
    creador: datosReceta.creadorId ? new mongoose.Types.ObjectId(datosReceta.creadorId) : undefined
  });

  await receta.save();
  return receta;
}

export async function obtenerRecetaService(recetaId: string) {
  const receta = await Receta.findById(recetaId);
  
  if (!receta) {
    const error = new Error('Receta no encontrada');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  return receta;
}

export async function obtenerRecetasService() {
  const recetas = await Receta.find().sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasService() {
  const recetas = await Receta.find({ publica: true }).sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerMisRecetasService(creadorId: string) {
  const recetas = await Receta.find({ creador: creadorId }).sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasYPropiasService(creadorId: string) {
  const recetas = await Receta.find({
    $or: [
      { publica: true },
      { creador: creadorId }
    ]
  }).sort({ nombreReceta: 1 });
  return recetas;
}

export interface ActualizarRecetaData {
  nombreReceta?: string;
  ingredientes?: string[];
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  informacionNutricional?: string;
  imagenes?: string[];
  imagenesAEliminar?: string[];
  publica?: boolean | string;
}

export async function actualizarRecetaService(recetaId: string, datosReceta: ActualizarRecetaData) {
  if (typeof datosReceta.publica === 'string') {
    datosReceta.publica = datosReceta.publica === 'true';
  }

  const updateData: Partial<{
    nombreReceta: string;
    ingredientes: string[];
    pasosPreparacion: string[];
    tiempoPreparacion: string;
    informacionNutricional: string;
    imagenes: string[];
    publica: boolean;
  }> = {};

  if (datosReceta.nombreReceta !== undefined) {
    updateData.nombreReceta = datosReceta.nombreReceta.trim();
  }

  if (datosReceta.ingredientes !== undefined) {
    updateData.ingredientes = datosReceta.ingredientes.map(ingrediente => ingrediente.trim());
  }

  if (datosReceta.pasosPreparacion !== undefined) {
    updateData.pasosPreparacion = datosReceta.pasosPreparacion.map(paso => paso.trim());
  }

  if (datosReceta.tiempoPreparacion !== undefined) {
    updateData.tiempoPreparacion = datosReceta.tiempoPreparacion.trim();
  }

  if (datosReceta.informacionNutricional !== undefined) {
    updateData.informacionNutricional = datosReceta.informacionNutricional.trim();
  }

  // Manejar imágenes: siempre obtener las existentes y procesarlas
  const recetaActual = await Receta.findById(recetaId);
  if (recetaActual) {
    let imagenesFinales = [...recetaActual.imagenes];
    
    // Eliminar imágenes marcadas para eliminar
    if (datosReceta.imagenesAEliminar && datosReceta.imagenesAEliminar.length > 0) {
      imagenesFinales = imagenesFinales.filter(
        imagen => !datosReceta.imagenesAEliminar!.includes(imagen)
      );
    }
    
    // Agregar nuevas imágenes si se proporcionan
    if (datosReceta.imagenes && datosReceta.imagenes.length > 0) {
      imagenesFinales = [...imagenesFinales, ...datosReceta.imagenes];
    }
    
    updateData.imagenes = imagenesFinales;
  }

  if (datosReceta.publica !== undefined) {
    updateData.publica = datosReceta.publica;
  }

  const receta = await Receta.findByIdAndUpdate(
    recetaId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!receta) {
    const error = new Error('Receta no encontrada');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  // Eliminar físicamente los archivos de imágenes marcadas para eliminar
  if (datosReceta.imagenesAEliminar && datosReceta.imagenesAEliminar.length > 0) {
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    
    datosReceta.imagenesAEliminar.forEach(imagenPath => {
      try {
        const rutaCompleta = path.join(uploadsPath, imagenPath.replace('/uploads/', ''));
        if (fs.existsSync(rutaCompleta)) {
          fs.unlinkSync(rutaCompleta);
          console.log(`Imagen eliminada: ${rutaCompleta}`);
        }
      } catch (error) {
        console.error(`Error al eliminar imagen ${imagenPath}:`, error);
      }
    });
  }

  return receta;
}

export async function eliminarRecetaService(recetaId: string) {
  const receta = await Receta.findByIdAndDelete(recetaId);

  if (!receta) {
    const error = new Error('Receta no encontrada');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  return receta;
}

export async function limpiarImagenesHuerfanasService() {
  try {
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    const recetasPath = path.join(uploadsPath, 'recetas');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(recetasPath)) {
      return { 
        mensaje: 'No hay directorio de imágenes de recetas',
        imagenesEliminadas: 0,
        imagenesEncontradas: 0
      };
    }

    // Obtener todas las imágenes en el directorio
    const archivosEnDirectorio = fs.readdirSync(recetasPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

    // Obtener todas las rutas de imágenes de las recetas en la base de datos
    const recetas = await Receta.find({}, 'imagenes');
    const imagenesEnUso = new Set<string>();
    
    recetas.forEach(receta => {
      receta.imagenes.forEach(imagen => {
        // Extraer solo el nombre del archivo de la ruta
        const nombreArchivo = path.basename(imagen);
        imagenesEnUso.add(nombreArchivo);
      });
    });

    // Encontrar imágenes huérfanas
    const imagenesHuerfanas = archivosEnDirectorio.filter(archivo => 
      !imagenesEnUso.has(archivo)
    );

    // Eliminar imágenes huérfanas
    let imagenesEliminadas = 0;
    imagenesHuerfanas.forEach(archivo => {
      try {
        const rutaCompleta = path.join(recetasPath, archivo);
        fs.unlinkSync(rutaCompleta);
        imagenesEliminadas++;
      } catch (error) {
        console.error(`Error al eliminar imagen ${archivo}:`, error);
      }
    });

    return {
      mensaje: `Limpieza completada. ${imagenesEliminadas} imágenes huérfanas eliminadas de ${archivosEnDirectorio.length} archivos encontrados`,
      imagenesEliminadas,
      imagenesEncontradas: archivosEnDirectorio.length,
      imagenesHuerfanas: imagenesHuerfanas
    };
  } catch (error) {
    console.error('Error en limpieza de imágenes huérfanas:', error);
    throw new Error('Error al limpiar imágenes huérfanas');
  }
}
