import { useState } from 'react';
import type { SesionPlan } from '../types/training';

interface EjercicioSesion {
  ejercicio: string;
  orden: number;
  series: number;
  repeticiones: number;
  peso?: number;
  tiempoDescanso: number;
  ejerciciosAlternativos?: string[];
  opcionesProgresion?: {
    aumentarPeso: boolean;
    masRepeticiones: boolean;
    mayorIntensidad: boolean;
  };
}

interface UseTrainingModalsReturn {
  // Estados de modales
  showEjerciciosModal: boolean;
  showEditarEjercicioModal: boolean;
  showEditarSesionModal: boolean;
  showEliminarSesionModal: boolean;
  showCrearSesionModal: boolean;
  
  // Estados de datos
  ejerciciosSesion: EjercicioSesion[];
  ejerciciosSesionActual: EjercicioSesion[];
  sesionAEliminar: SesionPlan | null;
  sesionAEditar: SesionPlan | null;
  ejercicioAEditar: EjercicioSesion | null;
  indiceEjercicioAEditar: number | null;
  sesionSeleccionada: SesionPlan | null;
  
  // Funciones para abrir modales
  openEjerciciosModal: () => void;
  openEditarEjercicioModal: (ejercicio: EjercicioSesion, indice: number) => void;
  openEditarSesionModal: (sesion: SesionPlan) => void;
  openEliminarSesionModal: (sesion: SesionPlan) => void;
  openCrearSesionModal: (sesion: SesionPlan | null) => void;
  
  // Funciones para cerrar modales
  closeEjerciciosModal: () => void;
  closeEditarEjercicioModal: () => void;
  closeEditarSesionModal: () => void;
  closeEliminarSesionModal: () => void;
  closeCrearSesionModal: () => void;
  
  // Funciones para actualizar estados
  setEjerciciosSesion: (ejercicios: EjercicioSesion[]) => void;
  setEjerciciosSesionActual: (ejercicios: EjercicioSesion[]) => void;
  setEjercicioAEditar: (ejercicio: EjercicioSesion | null) => void;
  setIndiceEjercicioAEditar: (indice: number | null) => void;
}

export const useTrainingModals = (): UseTrainingModalsReturn => {
  const [showEjerciciosModal, setShowEjerciciosModal] = useState<boolean>(false);
  const [showEditarEjercicioModal, setShowEditarEjercicioModal] = useState<boolean>(false);
  const [showEditarSesionModal, setShowEditarSesionModal] = useState<boolean>(false);
  const [showEliminarSesionModal, setShowEliminarSesionModal] = useState<boolean>(false);
  const [showCrearSesionModal, setShowCrearSesionModal] = useState<boolean>(false);
  
  const [ejerciciosSesion, setEjerciciosSesion] = useState<EjercicioSesion[]>([]);
  const [ejerciciosSesionActual, setEjerciciosSesionActual] = useState<EjercicioSesion[]>([]);
  const [sesionAEliminar, setSesionAEliminar] = useState<SesionPlan | null>(null);
  const [sesionAEditar, setSesionAEditar] = useState<SesionPlan | null>(null);
  const [ejercicioAEditar, setEjercicioAEditar] = useState<EjercicioSesion | null>(null);
  const [indiceEjercicioAEditar, setIndiceEjercicioAEditar] = useState<number | null>(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionPlan | null>(null);

  const openEjerciciosModal = () => setShowEjerciciosModal(true);
  const openEditarEjercicioModal = (ejercicio: EjercicioSesion, indice: number) => {
    setEjercicioAEditar(ejercicio);
    setIndiceEjercicioAEditar(indice);
    setShowEditarEjercicioModal(true);
  };
  const openEditarSesionModal = (sesion: SesionPlan) => {
    setSesionAEditar(sesion);
    setShowEditarSesionModal(true);
  };
  const openEliminarSesionModal = (sesion: SesionPlan) => {
    setSesionAEliminar(sesion);
    setShowEliminarSesionModal(true);
  };
  const openCrearSesionModal = (sesion: SesionPlan | null) => {
    setSesionSeleccionada(sesion);
    setShowCrearSesionModal(true);
  };

  const closeEjerciciosModal = () => {
    setShowEjerciciosModal(false);
    setEjerciciosSesion([]);
  };
  const closeEditarEjercicioModal = () => {
    setShowEditarEjercicioModal(false);
    setEjercicioAEditar(null);
    setIndiceEjercicioAEditar(null);
  };
  const closeEditarSesionModal = () => {
    setShowEditarSesionModal(false);
    setSesionAEditar(null);
  };
  const closeEliminarSesionModal = () => {
    setShowEliminarSesionModal(false);
    setSesionAEliminar(null);
  };
  const closeCrearSesionModal = () => {
    setShowCrearSesionModal(false);
    setSesionSeleccionada(null);
  };

  return {
    showEjerciciosModal,
    showEditarEjercicioModal,
    showEditarSesionModal,
    showEliminarSesionModal,
    showCrearSesionModal,
    ejerciciosSesion,
    ejerciciosSesionActual,
    sesionAEliminar,
    sesionAEditar,
    ejercicioAEditar,
    indiceEjercicioAEditar,
    sesionSeleccionada,
    openEjerciciosModal,
    openEditarEjercicioModal,
    openEditarSesionModal,
    openEliminarSesionModal,
    openCrearSesionModal,
    closeEjerciciosModal,
    closeEditarEjercicioModal,
    closeEditarSesionModal,
    closeEliminarSesionModal,
    closeCrearSesionModal,
    setEjerciciosSesion,
    setEjerciciosSesionActual,
    setEjercicioAEditar,
    setIndiceEjercicioAEditar
  };
};
