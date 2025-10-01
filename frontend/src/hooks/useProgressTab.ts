import { useState, useCallback, useMemo } from 'react';

export const useProgressTab = () => {
  // Función para obtener el número de semana actual (ISO 8601)
  const getCurrentWeekNumber = useCallback((): number => {
    const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }, []);

  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(getCurrentWeekNumber());
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);

  const handleVolverActual = useCallback(() => {
    setSemanaSeleccionada(getCurrentWeekNumber());
    setAñoSeleccionado(new Date().getFullYear());
    setMostrarHistorial(false);
  }, [getCurrentWeekNumber]);

  const isCurrentWeek = useMemo(() => 
    semanaSeleccionada === getCurrentWeekNumber() && añoSeleccionado === new Date().getFullYear(),
    [semanaSeleccionada, añoSeleccionado, getCurrentWeekNumber]
  );

  return useMemo(() => ({
    getCurrentWeekNumber,
    semanaSeleccionada,
    añoSeleccionado,
    mostrarHistorial,
    isCurrentWeek,
    setSemanaSeleccionada,
    setAñoSeleccionado,
    setMostrarHistorial,
    handleVolverActual
  }), [getCurrentWeekNumber, semanaSeleccionada, añoSeleccionado, mostrarHistorial, isCurrentWeek, setSemanaSeleccionada, setAñoSeleccionado, setMostrarHistorial, handleVolverActual]);
};
