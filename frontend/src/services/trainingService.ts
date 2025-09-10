import { apiRequest } from './api';
import type { 
  Ejercicio, 
  CrearEjercicioDTO, 
  ActualizarEjercicioDTO, 
  PlanEntrenamiento, 
  CrearPlanDTO, 
  ActualizarPlanDTO, 
  SesionPlan, 
  CrearSesionDTO, 
  ActualizarSesionDTO 
} from '../types/training';

const base = '/api/training';

export const trainingService = {
  // Ejercicios
  async crearEjercicio(data: CrearEjercicioDTO): Promise<Ejercicio> {
    const res = await apiRequest(`${base}/ejercicios`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al crear ejercicio');
    return await res.json();
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
    return await res.json();
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
    console.log('Respuesta del backend al crear plan:', response);
    return response.plan || response;
  },

  async obtenerPlanes(params: Record<string, string | number | boolean> = {}): Promise<PlanEntrenamiento[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiRequest(`${base}/planes${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener planes');
    const data = await res.json();
    return data.planes || data.items || data;
  },

  async obtenerPlanPorId(id: string): Promise<PlanEntrenamiento> {
    const res = await apiRequest(`${base}/planes/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener plan');
    const response = await res.json();
    console.log('Respuesta del backend al obtener plan:', response);
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

  // Sesiones
  async crearSesion(data: CrearSesionDTO): Promise<SesionPlan> {
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
    console.log('Respuesta del backend al obtener sesiones:', data);
    return data.sesiones || data.items || data;
  },

  async obtenerSesionPorId(id: string): Promise<SesionPlan> {
    const res = await apiRequest(`${base}/sesiones/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener sesión');
    return await res.json();
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
};

export default trainingService;


