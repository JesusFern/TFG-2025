import { useNavigate } from 'react-router-dom';
import type { PlanEntrenamiento } from '../types/training';
import type { BreadcrumbItem } from '../types/trainingCommon';
import { BREADCRUMBS_TRAINING_BASE, BREADCRUMBS_DIET_BASE } from '../constants/training';
import { getClientIdFromPlan } from '../utils/trainingUtils';

interface UseNavigationReturn {
  navigateToClientPlans: (plan: PlanEntrenamiento) => void;
  navigateToPlansList: () => void;
  navigateToPlanView: (planId: string) => void;
  navigateToPlanEdit: (planId: string) => void;
  getTrainingBreadcrumbs: (currentPage: string) => BreadcrumbItem[];
  getDietBreadcrumbs: (currentPage: string, clientId?: string) => BreadcrumbItem[];
}

export const useNavigation = (): UseNavigationReturn => {
  const navigate = useNavigate();

  const navigateToClientPlans = (plan: PlanEntrenamiento) => {
    try {
      const clientId = getClientIdFromPlan(plan);
      
      if (clientId) {
        navigate(`/worker/dashboard-clients/${clientId}/training`);
      } else {
        navigate(-1);
      }
    } catch {
      navigate(-1);
    }
  };

  const getTrainingBreadcrumbs = (currentPage: string): BreadcrumbItem[] => {
    switch (currentPage) {
      case 'ver':
        return [...BREADCRUMBS_TRAINING_BASE, { title: 'Ver plan', href: '#' }];
      case 'editar':
        return [...BREADCRUMBS_TRAINING_BASE, { title: 'Editar plan', href: '#' }];
      case 'crear':
        return [...BREADCRUMBS_TRAINING_BASE, { title: 'Crear plan', href: '#' }];
      default:
        return BREADCRUMBS_TRAINING_BASE;
    }
  };

  const navigateToPlansList = () => {
    navigate('/training/planes');
  };

  const navigateToPlanView = (planId: string) => {
    navigate(`/training/planes/${planId}`);
  };

  const navigateToPlanEdit = (planId: string) => {
    navigate(`/editar-plan-entrenamiento/${planId}`);
  };

  const getDietBreadcrumbs = (currentPage: string, clientId?: string): BreadcrumbItem[] => {
    const baseBreadcrumbs = [...BREADCRUMBS_DIET_BASE];

    if (clientId) {
      baseBreadcrumbs.push({ title: 'Detalles del cliente', href: `/clientes/${clientId}` });
    }

    switch (currentPage) {
      case 'crear':
        return [...baseBreadcrumbs, { title: 'Crear dieta', href: '#' }];
      case 'editar':
        return [...baseBreadcrumbs, { title: 'Editar dieta', href: '#' }];
      case 'ver':
        return [...baseBreadcrumbs, { title: 'Ver dieta', href: '#' }];
      default:
        return baseBreadcrumbs;
    }
  };

  return {
    navigateToClientPlans,
    navigateToPlansList,
    navigateToPlanView,
    navigateToPlanEdit,
    getTrainingBreadcrumbs,
    getDietBreadcrumbs
  };
};
