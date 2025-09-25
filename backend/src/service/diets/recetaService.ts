import Receta from '../../models/diets/receta';
import Ingrediente from '../../models/diets/ingrediente';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface CrearRecetaData {
  nombreReceta: string;
  ingredientes: Array<{
    nombre: string;
    peso: number;
    informacionNutricional: {
      calorias: number;
      proteinas: number;
      carbohidratos: number;
      grasas: number;
      fibra?: number;
      azucares?: number;
      sal?: number;
      sodio?: number;
    };
    marca?: string;
    id?: string; // ID del ingrediente (null para OpenFoodFacts)
    imagenIngrediente?: string;
    fuente?: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  }>;
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
  imagenes?: string[];
  publica: boolean | string;
  creadorId: string;
}

// Función auxiliar para procesar ingredientes
async function procesarIngredientes(ingredientesData: CrearRecetaData['ingredientes']) {
  const ingredientesProcesados = [];

  console.log('Procesando ingredientes:', JSON.stringify(ingredientesData, null, 2));

  for (const ingredienteData of ingredientesData) {
    console.log('Procesando ingrediente:', JSON.stringify(ingredienteData, null, 2));
    let ingrediente;

    // Si tiene ID, es un ingrediente local existente
    if (ingredienteData.id) {
      console.log(`Buscando ingrediente por ID: ${ingredienteData.id}`);
      ingrediente = await Ingrediente.findById(ingredienteData.id);
      if (!ingrediente) {
        throw new Error(`Ingrediente con ID ${ingredienteData.id} no encontrado`);
      }
      console.log(`Ingrediente encontrado por ID:`, ingrediente.nombre);
    } else {
      // Si no tiene ID, buscar por nombre o crear uno nuevo
      console.log(`Buscando ingrediente por nombre: ${ingredienteData.nombre}`);
      ingrediente = await Ingrediente.findOne({ 
        nombre: { $regex: new RegExp(`^${ingredienteData.nombre}$`, 'i') } 
      });
      
      if (ingrediente) {
        console.log(`Ingrediente encontrado por nombre:`, ingrediente.nombre, `ID:`, ingrediente._id);
      } else {
        console.log(`Ingrediente no encontrado por nombre, se creará uno nuevo`);
      }

      // Si no existe, crear uno nuevo
      if (!ingrediente) {
        // Determinar la fuente: si tiene imagen es de OpenFoodFacts, si no es de Trabajador
        const fuente = ingredienteData.imagenIngrediente ? 'Openfoodfacts' : 'Trabajador';
        console.log(`Creando nuevo ingrediente con fuente: ${fuente}`);
        
        // Verificar una vez más si no existe antes de crear
        const ingredienteExistente = await Ingrediente.findOne({ 
          nombre: { $regex: new RegExp(`^${ingredienteData.nombre}$`, 'i') } 
        });
        
        if (ingredienteExistente) {
          console.log(`Ingrediente encontrado en verificación final:`, ingredienteExistente.nombre);
          ingrediente = ingredienteExistente;
        } else {
          ingrediente = new Ingrediente({
            nombre: ingredienteData.nombre,
            calorias: ingredienteData.informacionNutricional.calorias,
            proteinas: ingredienteData.informacionNutricional.proteinas,
            grasas: ingredienteData.informacionNutricional.grasas,
            hidratosCarbono: ingredienteData.informacionNutricional.carbohidratos,
            fibra: ingredienteData.informacionNutricional.fibra || 0,
            azucares: ingredienteData.informacionNutricional.azucares || 0,
            sal: ingredienteData.informacionNutricional.sal || 0,
            sodio: ingredienteData.informacionNutricional.sodio || 0,
            marca: ingredienteData.marca,
            imagenIngrediente: ingredienteData.imagenIngrediente,
            fuente: fuente
          });
          await ingrediente.save();
          console.log(`Ingrediente creado con ID:`, ingrediente._id);
        }
      }
    }

    ingredientesProcesados.push({
      ingrediente: ingrediente._id,
      peso: ingredienteData.peso
    });
    
    console.log(`Ingrediente procesado: ${ingrediente.nombre} con ID: ${ingrediente._id}`);
  }

  console.log('Ingredientes procesados finales:', ingredientesProcesados);
  return ingredientesProcesados;
}

export async function crearRecetaService(datosReceta: CrearRecetaData) {
  if (typeof datosReceta.publica === 'string') {
    datosReceta.publica = datosReceta.publica === 'true';
  }

  // Procesar ingredientes
  const ingredientesProcesados = await procesarIngredientes(datosReceta.ingredientes);

  const receta = new Receta({
    nombreReceta: datosReceta.nombreReceta.trim(),
    ingredientes: ingredientesProcesados,
    pasosPreparacion: datosReceta.pasosPreparacion?.map(paso => paso.trim()) || [],
    tiempoPreparacion: datosReceta.tiempoPreparacion?.trim() || '',
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
  const recetas = await Receta.find().populate('ingredientes.ingrediente').sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasService() {
  const recetas = await Receta.find({ publica: true }).populate('ingredientes.ingrediente').sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerMisRecetasService(creadorId: string) {
  const recetas = await Receta.find({ creador: creadorId }).populate('ingredientes.ingrediente').sort({ nombreReceta: 1 });
  return recetas;
}

export async function obtenerRecetasPublicasYPropiasService(creadorId: string) {
  const recetas = await Receta.find({
    $or: [
      { publica: true },
      { creador: creadorId }
    ]
  }).populate('ingredientes.ingrediente').sort({ nombreReceta: 1 });
  return recetas;
}

export async function buscarRecetasService(termino: string, creadorId: string) {
  // Si no hay término, devolver recetas públicas y privadas del nutricionista
  if (!termino || termino.trim().length === 0) {
    const recetas = await Receta.find({
      $or: [
        { publica: true },
        { creador: creadorId }
      ]
    }).populate('ingredientes.ingrediente').sort({ nombreReceta: 1 }).limit(10);
    
    return recetas;
  }

  const terminoBusqueda = termino.trim();
  
  // Buscar en recetas públicas y privadas del nutricionista
  // Solo buscar por nombre de receta, ya que ingredientes es un array de subdocumentos
  const recetas = await Receta.find({
    $and: [
      {
        $or: [
          { publica: true },
          { creador: creadorId }
        ]
      },
      {
        nombreReceta: { $regex: terminoBusqueda, $options: 'i' }
      }
    ]
  }).populate('ingredientes.ingrediente').sort({ nombreReceta: 1 }).limit(10);

  return recetas;
}

export interface ActualizarRecetaData {
  nombreReceta?: string;
  ingredientes?: Array<{
    nombre: string;
    peso: number;
    informacionNutricional: {
      calorias: number;
      proteinas: number;
      carbohidratos: number;
      grasas: number;
      fibra?: number;
      azucares?: number;
      sal?: number;
      sodio?: number;
    };
    marca?: string;
    id?: string; // ID del ingrediente (null para OpenFoodFacts)
    imagenIngrediente?: string;
    fuente?: 'Interna' | 'Openfoodfacts' | 'Trabajador';
  }>;
  pasosPreparacion?: string[];
  tiempoPreparacion?: string;
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
    ingredientes: Array<{ ingrediente: mongoose.Types.ObjectId; peso: number }>;
    pasosPreparacion: string[];
    tiempoPreparacion: string;
    imagenes: string[];
    publica: boolean;
  }> = {};

  if (datosReceta.nombreReceta !== undefined) {
    updateData.nombreReceta = datosReceta.nombreReceta.trim();
  }

  if (datosReceta.ingredientes !== undefined) {
    updateData.ingredientes = await procesarIngredientes(datosReceta.ingredientes);
  }

  if (datosReceta.pasosPreparacion !== undefined) {
    updateData.pasosPreparacion = datosReceta.pasosPreparacion.map(paso => paso.trim());
  }

  if (datosReceta.tiempoPreparacion !== undefined) {
    updateData.tiempoPreparacion = datosReceta.tiempoPreparacion.trim();
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

    const archivosEnDirectorio = fs.readdirSync(recetasPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

    const recetas = await Receta.find({}, 'imagenes');
    const imagenesEnUso = new Set<string>();
    
    recetas.forEach(receta => {
      receta.imagenes.forEach(imagen => {
        const nombreArchivo = path.basename(imagen);
        imagenesEnUso.add(nombreArchivo);
      });
    });

    const imagenesHuerfanas = archivosEnDirectorio.filter(archivo => 
      !imagenesEnUso.has(archivo)
    );

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

export function procesarImagenesSubidas(files: Express.Multer.File[]): string[] {
  const imagenes: string[] = [];
  
  if (files && files.length > 0) {
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    files.forEach(file => {
      const relativePath = path.relative(uploadsPath, file.path);
      const normalizedPath = relativePath.replace(/\\/g, '/');
      imagenes.push(`/uploads/${normalizedPath}`);
    });
  }
  
  return imagenes;
}