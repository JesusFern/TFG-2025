import { useMemo } from 'react';
import { format } from 'date-fns';
import type { PlanEntrenamiento, SesionPlan } from '../types/training';

interface SesionInfo {
  weekDayIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  data: SesionPlan | null;
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface UseSesionesRangeProps {
  plan: PlanEntrenamiento | null;
  sesiones: SesionPlan[];
  currentWeek: number;
  fechaInicio: Date | null;
}

export const useSesionesRange = ({ plan, sesiones, currentWeek, fechaInicio }: UseSesionesRangeProps) => {
  return useMemo(() => {
    if (!plan || !fechaInicio) return { sesiones: [] as SesionInfo[], totalWeeks: 0 };
    
    const totalWeeks = Math.ceil(plan.duracionDias / 7);
    const weekStartIndex = (currentWeek - 1) * 7;
    const sesionesSemana: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = weekStartIndex + i;
      
      if (dayIndex < plan.duracionDias) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + dayIndex);
        
        const diaSemana = fecha.getDay();
        const weekDayName = DIAS_SEMANA[diaSemana];
        const fechaFormateada = format(fecha, 'dd/MM');
        
        const sesionExistente = sesiones.find(sesion => {
          const sesionFecha = new Date(sesion.fecha);
          return sesionFecha.toDateString() === fecha.toDateString();
        });
        
        sesionesSemana.push({
          weekDayIndex: i,
          weekDayName,
          fecha,
          fechaFormateada,
          data: sesionExistente || null
        });
      }
    }
    
    return { sesiones: sesionesSemana, totalWeeks };
  }, [plan, currentWeek, sesiones, fechaInicio]);
};
