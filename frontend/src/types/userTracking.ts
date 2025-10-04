export interface UserTrackingDto {
  _id: string;
  userId: string;
  fechaSeguimiento: string;
  
  // Mediciones individuales (opcionales)
  pesoCorporal?: number;
  porcentajeGrasaCorporal?: number;
  porcentajeMasaMuscular?: number;
  
  // Perímetros
  perimetroCintura?: number;
  perimetroCadera?: number;
  perimetroPecho?: number;
  
  // Perímetros bilaterales (opcionales)
  perimetroBrazoIzquierdo?: number;
  perimetroBrazoDerecho?: number;
  perimetroMusloIzquierdo?: number;
  perimetroMusloDerecho?: number;
  
  // Archivos multimedia del seguimiento
  archivosMultimedia: string[];
  
  // Campos del sistema
  createdAt: string;
  updatedAt: string;
}

export interface ArchivoMultimedia {
  path: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface CreateUserTrackingDto {
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
  fechaSeguimiento?: string;
}

export interface UpdateUserTrackingDto {
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
}