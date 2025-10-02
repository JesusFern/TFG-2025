export interface CrearIncidenciaData {
  descripcion: string;
  creadorId: string;
}

export interface ResolverIncidenciaData {
  estado: 'Por resolver' | 'En proceso de resolución' | 'Resuelta';
  administradorId: string;
}

export interface IncidenciaResponse {
  id: string;
  descripcion: string;
  estado: string;
  creadorId: string;
  administradorAsignado?: string;
  imagenes?: string[];
  fechaResolucion?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Información del creador (para admin)
  creador?: {
    fullName: string;
    email: string;
    role: string;
    workerType?: string;
  };
  // Información del administrador asignado (para admin)
  administrador?: {
    fullName: string;
    email: string;
  };
}
