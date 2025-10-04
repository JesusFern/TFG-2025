import UserTracking from '../../models/users/userTracking';
import User from '../../models/users/user';
import mongoose from 'mongoose';

export class UserTrackingService {
  /**
   * Crear un nuevo registro de seguimiento
   */
  static async createUserTracking(userId: string, data: {
    pesoCorporal?: number;
    porcentajeGrasaCorporal?: number;
    porcentajeMasaMuscular?: number;
    perimetroCintura?: number;
    perimetroCadera?: number;
    perimetroPecho?: number;
    perimetroBrazoIzquierdo?: number;
    perimetroBrazoDerecho?: number;
    perimetroMusloIzquierdo?: number;
    perimetroMusloDerecho?: number;
    archivosMultimedia?: string[];
    fechaSeguimiento?: Date;
  }) {
    // Validar que userId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID de usuario inválido');
    }
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    
    // Verificar que el usuario existe
    const user = await User.findById(userIdObjectId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const tracking = await UserTracking.create({
      userId: userIdObjectId,
      fechaSeguimiento: data.fechaSeguimiento || new Date(),
      pesoCorporal: data.pesoCorporal,
      porcentajeGrasaCorporal: data.porcentajeGrasaCorporal,
      porcentajeMasaMuscular: data.porcentajeMasaMuscular,
      perimetroCintura: data.perimetroCintura,
      perimetroCadera: data.perimetroCadera,
      perimetroPecho: data.perimetroPecho,
      perimetroBrazoIzquierdo: data.perimetroBrazoIzquierdo,
      perimetroBrazoDerecho: data.perimetroBrazoDerecho,
      perimetroMusloIzquierdo: data.perimetroMusloIzquierdo,
      perimetroMusloDerecho: data.perimetroMusloDerecho,
      archivosMultimedia: data.archivosMultimedia || []
    });

    return tracking;
  }

  /**
   * Obtener todos los registros de seguimiento de un usuario
   */
  static async getTrackingByUserId(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID de usuario inválido');
    }
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    
    const trackings = await UserTracking.find({ userId: userIdObjectId })
      .sort({ fechaSeguimiento: -1 }); // Más recientes primero
    
    return trackings;
  }


  /**
   * Actualizar un registro de seguimiento existente
   */
  static async updateTracking(trackingId: string, data: {
    pesoCorporal?: number;
    porcentajeGrasaCorporal?: number;
    porcentajeMasaMuscular?: number;
    perimetroCintura?: number;
    perimetroCadera?: number;
    perimetroPecho?: number;
    perimetroBrazoIzquierdo?: number;
    perimetroBrazoDerecho?: number;
    perimetroMusloIzquierdo?: number;
    perimetroMusloDerecho?: number;
    archivosMultimedia?: string[];
  }) {
    if (!mongoose.Types.ObjectId.isValid(trackingId)) {
      throw new Error('ID de seguimiento inválido');
    }
    const trackingIdObjectId = new mongoose.Types.ObjectId(trackingId);
    
    const tracking = await UserTracking.findByIdAndUpdate(
      trackingIdObjectId,
      { $set: data },
      { new: true }
    );
    
    if (!tracking) {
      throw new Error('Registro de seguimiento no encontrado');
    }
    
    return tracking;
  }


  /**
   * Obtener seguimiento de un cliente para un trabajador
   */
  static async getTrackingForWorker(workerId: string, userId: string) {
    const workerIdObjectId = new mongoose.Types.ObjectId(workerId);
    const worker = await User.findById(workerIdObjectId).select('clientesAsignados role');
    
    if (!worker) {
      throw new Error('Trabajador no encontrado');
    }
    
    if (worker.role !== 'worker') {
      throw new Error('El usuario no es un trabajador');
    }
    
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const tieneAcceso = worker.clientesAsignados?.some(
      cliente => cliente.clienteId.toString() === userIdObjectId.toString()
    );
    
    if (!tieneAcceso) {
      throw new Error('No tienes acceso a este cliente');
    }
    
    return await this.getTrackingByUserId(userId);
  }

  /**
   * Agregar archivo multimedia a un registro
   */
  static async addArchivoMultimedia(trackingId: string, archivoPath: string) {
    if (!mongoose.Types.ObjectId.isValid(trackingId)) {
      throw new Error('ID de seguimiento inválido');
    }
    const trackingIdObjectId = new mongoose.Types.ObjectId(trackingId);
    
    const tracking = await UserTracking.findById(trackingIdObjectId);
    if (!tracking) {
      throw new Error('Registro de seguimiento no encontrado');
    }
    
    if (tracking.archivosMultimedia.length >= 3) {
      throw new Error('Máximo 3 archivos multimedia por seguimiento');
    }
    
    tracking.archivosMultimedia.push(archivoPath);
    await tracking.save();
    
    return tracking;
  }

  /**
   * Eliminar archivo multimedia de un registro
   */
  static async removeArchivoMultimedia(trackingId: string, archivoPath: string) {
    if (!mongoose.Types.ObjectId.isValid(trackingId)) {
      throw new Error('ID de seguimiento inválido');
    }
    const trackingIdObjectId = new mongoose.Types.ObjectId(trackingId);
    
    const tracking = await UserTracking.findById(trackingIdObjectId);
    if (!tracking) {
      throw new Error('Registro de seguimiento no encontrado');
    }
    
    tracking.archivosMultimedia = tracking.archivosMultimedia.filter(archivo => archivo !== archivoPath);
    await tracking.save();
    
    return tracking;
  }

}