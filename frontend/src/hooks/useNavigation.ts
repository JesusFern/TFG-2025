import { useNavigate } from 'react-router-dom';
import type { PlanEntrenamiento } from '../types/training';

interface BreadcrumbItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

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
      let clientId = null;
      
      if (plan && plan.clientes && Array.isArray(plan.clientes) && plan.clientes.length > 0) {
        const clientData = plan.clientes[0];
        
        if (typeof clientData === 'string') {
          clientId = clientData;
        } 
        else if (typeof clientData === 'object' && clientData !== null) {
          type ClientObject = { _id?: string; id?: string; };
          const clientObj = clientData as unknown as ClientObject;
          
          if (clientObj._id) {
            clientId = clientObj._id;
          } else if (clientObj.id) {
            clientId = clientObj.id;
          } else {
            clientId = String(clientData);
          }
        }
        else if (clientData) {
          clientId = String(clientData);
        }
      }
      
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
    const baseBreadcrumbs = [
      { title: 'Inicio', href: '/', icon: undefined },
      { title: 'Entrenamiento', href: '/training/planes' }
    ];

    switch (currentPage) {
      case 'ver':
        return [...baseBreadcrumbs, { title: 'Ver plan', href: '#' }];
      case 'editar':
        return [...baseBreadcrumbs, { title: 'Editar plan', href: '#' }];
      case 'crear':
        return [...baseBreadcrumbs, { title: 'Crear plan', href: '#' }];
      default:
        return baseBreadcrumbs;
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
    const baseBreadcrumbs = [
      { title: 'Inicio', href: '/', icon: undefined },
      { title: 'Clientes', href: '/clientes' }
    ];

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
