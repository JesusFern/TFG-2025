import { apiRequest } from './api';
import type { 
  Ejercicio, 
  CrearEjercicioDTO, 
  ActualizarEjercicioDTO, 
  PlanEntrenamiento, 
  CrearPlanDTO, 
  ActualizarPlanDTO, 
  SesionPlan, 
  CrearSesionAPIDTO,
  ActualizarSesionDTO 
} from '../types/training';

const base = '/api/training';

export const trainingService = {
  // Ejercicios
  async crearEjercicio(data: CrearEjercicioDTO | FormData): Promise<Ejercicio> {
    const isFormData = data instanceof FormData;
    const res = await apiRequest(`${base}/ejercicios`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al crear ejercicio');
    const response = await res.json();
    return response.ejercicio;
  },

  async obtenerEjercicios(params: Record<string, string | number | boolean> = {}): Promise<Ejercicio[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiRequest(`${base}/ejercicios${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener ejercicios');
    const data = await res.json();
    return data.ejercicios || data.items || data;
  },

  async obtenerEjercicioPorId(id: string): Promise<Ejercicio> {
    const res = await apiRequest(`${base}/ejercicios/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener ejercicio');
    const data = await res.json();
    return data.ejercicio;
  },

  async obtenerEjercicioPorSlug(slug: string): Promise<Ejercicio> {
    const res = await apiRequest(`${base}/ejercicios/slug/${slug}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener ejercicio');
    const data = await res.json();
    return data.ejercicio;
  },

  async actualizarEjercicio(id: string, data: ActualizarEjercicioDTO): Promise<Ejercicio> {
    const res = await apiRequest(`${base}/ejercicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al actualizar ejercicio');
    return await res.json();
  },

  async eliminarEjercicio(id: string): Promise<void> {
    const res = await apiRequest(`${base}/ejercicios/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar ejercicio');
  },

  // Planes de entrenamiento
  async crearPlan(data: CrearPlanDTO): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al crear plan');
    const response = await res.json();
    return response.plan || response;
  },

  async obtenerPlanes(params: Record<string, string | number | boolean> = {}): Promise<PlanEntrenamiento[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const url = `${base}/planes${query ? `?${query}` : ''}`;
    
    
    const res = await apiRequest(url);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener planes');
    const data = await res.json();
    
    return data.planes || data.items || data;
  },

  async obtenerPlanPorId(id: string): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener plan');
    const response = await res.json();
    return response.plan || response;
  },

  async actualizarPlan(id: string, data: ActualizarPlanDTO): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al actualizar plan');
    return await res.json();
  },

  async eliminarPlan(id: string): Promise<void> {
    const res = await apiRequest(`${base}/planes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar plan');
  },

  async asignarCliente(planId: string, clienteId: string): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${planId}/clientes`, {
      method: 'POST',
      body: JSON.stringify({ clienteId })
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al asignar cliente');
    return await res.json();
  },

  async removerCliente(planId: string, clienteId: string): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${planId}/clientes/${clienteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al remover cliente');
    return await res.json();
  },

  async publicarPlan(id: string): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${id}/publicar`, { method: 'PATCH' });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al publicar plan');
    return await res.json();
  },

  // Sesiones
  async crearSesion(data: CrearSesionAPIDTO): Promise<{ message: string; sesion: SesionPlan }> {
    const res = await apiRequest(`${base}/sesiones`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al crear sesión');
    return await res.json();
  },

  async obtenerSesiones(params: Record<string, string | number | boolean> = {}): Promise<SesionPlan[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiRequest(`${base}/sesiones${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener sesiones');
    const data = await res.json();
    return data.sesiones || data.items || data;
  },

  async obtenerSesionPorId(id: string): Promise<SesionPlan> {
    const res = await apiRequest(`${base}/sesiones/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener sesión');
    const data = await res.json();
    return data.sesion;
  },

  async actualizarSesion(id: string, data: ActualizarSesionDTO): Promise<SesionPlan> {
    const res = await apiRequest(`${base}/sesiones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al actualizar sesión');
    return await res.json();
  },

  async eliminarSesion(id: string): Promise<void> {
    const res = await apiRequest(`${base}/sesiones/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar sesión');
  },

  // Plantillas
  async obtenerObjetivosDisponibles(): Promise<string[]> {
    const res = await apiRequest(`${base}/planes/plantillas/objetivos`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener objetivos');
    const data = await res.json();
    return data.objetivos;
  },

  async obtenerPlantillaPorObjetivo(objetivo: string): Promise<{ plantilla: unknown; objetivo: string }> {
    const res = await apiRequest(`${base}/planes/plantillas/objetivo/${encodeURIComponent(objetivo)}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener plantilla');
    return await res.json();
  },

  async buscarPlantillas(filtros: Record<string, string> = {}): Promise<unknown[]> {
    const query = new URLSearchParams(filtros).toString();
    const res = await apiRequest(`${base}/planes/plantillas/buscar${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al buscar plantillas');
    const data = await res.json();
    return data.plantillas;
  },

  async generarPlanDesdePlantilla(data: {
    objetivo: string;
    duracionSemanas: number;
    sesionesPorSemana: number;
    diasSemana: number[];
    nivelDificultad: string;
    clientId: string;
    fechaInicio: Date;
    nombre: string;
    descripcion: string;
    clientes: string[];
    publico: boolean;
  }): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/plantillas/generar`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        fechaInicio: data.fechaInicio.toISOString()
      })
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al generar plan desde plantilla');
    const response = await res.json();
    return response.plan;
  },
};

export default trainingService;


