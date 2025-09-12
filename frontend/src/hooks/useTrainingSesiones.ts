import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PlanEntrenamiento, SesionPlan } from '../types/training';

interface SesionInfo {
  weekDayIndex: number;
  sesionIndex: number;
  weekDayName: string;
  fecha: Date;
  fechaFormateada: string;
  nombreCompleto: string;
  data: SesionPlan | null;
}


interface UseTrainingSesionesProps {
  plan: PlanEntrenamiento | null;
  sesiones: SesionPlan[];
  currentWeek: number;
  fechaInicio: Date | null;
}

export const useTrainingSesiones = ({ plan, sesiones, currentWeek, fechaInicio }: UseTrainingSesionesProps) => {
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [currentSesionLocal, setCurrentSesionLocal] = useState<SesionInfo | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const sesionesInfo: SesionInfo[] = useMemo(() => {
    if (!plan || !fechaInicio) return [];
    
    const diasSemana = plan.diasSemana;
    const sesionesDeLaSemana: SesionInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const fechaDelDia = new Date(fechaInicio);
      fechaDelDia.setDate(fechaDelDia.getDate() + (currentWeek - 1) * 7 + i);
      
      const sesionDelDia = sesiones.find(sesion => {
        const sesionFecha = new Date(sesion.fecha);
        return sesionFecha.toDateString() === fechaDelDia.toDateString();
      });
      
      sesionesDeLaSemana.push({
        weekDayIndex: i,
        sesionIndex: i,
        weekDayName: String(diasSemana[i]),
        fecha: fechaDelDia,
        fechaFormateada: format(fechaDelDia, 'dd/MM', { locale: es }),
        nombreCompleto: `${diasSemana[i]} ${format(fechaDelDia, 'dd/MM', { locale: es })}`,
        data: sesionDelDia || null
      });
    }
    
    return sesionesDeLaSemana;
  }, [plan, sesiones, currentWeek, fechaInicio]);

  const sesionesConDatos = sesionesInfo.filter((sesion: SesionInfo) => sesion.data !== null);
  const sesionesSinDatos = sesionesInfo.filter((sesion: SesionInfo) => sesion.data === null);

  useEffect(() => {
    const sesionParam = new URLSearchParams(window.location.search).get('sesion');
    if (sesionParam && sesionesConDatos.length > 0) {
      const sesionEncontrada = sesionesConDatos.find((s: SesionInfo) => s.data?._id === sesionParam);
      if (sesionEncontrada) {
        const indice = sesionesConDatos.indexOf(sesionEncontrada);
        setActiveTab(indice.toString());
        setCurrentSesionLocal(sesionEncontrada);
      }
    } else if (sesionesConDatos.length > 0) {
      setActiveTab("0");
      setCurrentSesionLocal(sesionesConDatos[0]);
    }
  }, [sesionesConDatos, location.search]);

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
    if (value !== null) {
      const indice = parseInt(value);
      setCurrentSesionLocal(sesionesConDatos[indice]);
    }
  };

  const handleWeekChange = () => {
    setActiveTab("0");
    setCurrentSesionLocal(null);
  };

  const refreshSesiones = () => {
    setForceUpdate(prev => prev + 1);
  };

  return {
    sesionesInfo,
    sesionesConDatos,
    sesionesSinDatos,
    activeTab,
    currentSesionLocal,
    forceUpdate,
    handleTabChange,
    handleWeekChange,
    refreshSesiones,
    setCurrentSesionLocal
  };
};
