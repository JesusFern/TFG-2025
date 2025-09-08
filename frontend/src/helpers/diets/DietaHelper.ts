import { format, parseISO, parse, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DiaDieta, DayInfo } from '../../types/diets';

// Constantes
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Utilidades para fechas
export const convertirDiaSemana = (diaSemana: number): number => {
  return diaSemana === 0 ? 6 : diaSemana - 1;
};

export const parseFecha = (fecha: string | Date): Date => {
  if (typeof fecha !== 'string') return new Date(fecha);
  
  try {
    if (fecha.includes('T') || fecha.includes('Z')) return parseISO(fecha);
    if (fecha.includes('-') && fecha.split('-').length === 3) return parse(fecha, 'dd-MM-yyyy', new Date());
    return new Date(fecha);
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return new Date();
  }
};

// Función para obtener el día de la semana ajustado
export const obtenerDiaSemanaAjustado = (fecha: string | Date): number => {
  const fechaDate = parseFecha(fecha);
  return convertirDiaSemana(getDay(fechaDate));
};

// Función para formatear fecha
export const formatearFecha = (fecha: string | Date, formatoString: string = "d 'de' MMMM 'de' yyyy"): string => {
  try {
    const fechaDate = parseFecha(fecha);
    return format(fechaDate, formatoString, { locale: es });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return typeof fecha === 'string' ? fecha : fecha.toString();
  }
};

// Crear función para generar datos de día
export const crearDatoDia = (
  index: number, 
  dietDayIndex: number, 
  fechaBase: Date, 
  dias: DiaDieta[]
): DayInfo => {
  const fechaDia = addDays(fechaBase, dietDayIndex);
  const fechaFormateada = formatearFecha(fechaDia, "d 'de' MMMM");
  
  return {
    weekDayIndex: index,
    dietDayIndex: dietDayIndex,
    weekDayName: DIAS_SEMANA[index],
    fecha: fechaDia,
    fechaFormateada: fechaFormateada,
    nombreCompleto: `${DIAS_SEMANA[index]} ${fechaFormateada}`,
    data: dias[dietDayIndex]
  };
};

// Estilos comunes para las vistas de dietas
export const dietaStyles = {
  paperBg: { backgroundColor: 'var(--app-paper-bg)' },
  paperBorder: { borderColor: 'var(--app-border-color)' },
  borderBottom: { borderBottom: '1px solid var(--app-border-color)' },
  greenBg: (isDark: boolean) => ({ 
    backgroundColor: isDark ? 'rgba(35, 139, 80, 0.1)' : 'rgba(35, 139, 80, 0.05)'
  }),
  greenBgDarker: (isDark: boolean) => ({ 
    backgroundColor: isDark ? 'rgba(35, 139, 80, 0.15)' : 'rgba(35, 139, 80, 0.08)'
  }),
  cellBorders: {
    borderBottom: '1px solid var(--app-border-color)',
    borderLeft: '1px solid var(--app-border-color)',
    borderRight: '1px solid var(--app-border-color)'
  },
  greenBorder: { borderBottom: '3px solid var(--mantine-color-nutroos-green-6)' },
  mealTitle: (isDark: boolean) => ({
    backgroundColor: isDark ? 'rgba(35, 139, 80, 0.12)' : 'rgba(35, 139, 80, 0.08)',
    borderRadius: '4px',
    display: 'inline-block',
    width: '100%',
    borderLeft: '2px solid var(--mantine-color-nutroos-green-6)'
  }),
  rowBg: (isDark: boolean, isEven: boolean) => ({
    backgroundColor: isEven ? 
      (isDark ? 'rgba(35, 35, 35, 0.4)' : 'rgba(250, 250, 250, 0.8)') : 
      (isDark ? 'rgba(35, 35, 35, 0.2)' : 'white')
  }),
  tableHeader: (isDark: boolean) => ({
    width: `${100 / 7}%`,
    padding: '8px 4px',
    backgroundColor: isDark ? 'rgba(35, 139, 80, 0.15)' : 'rgba(35, 139, 80, 0.08)',
    borderBottom: '3px solid var(--mantine-color-nutroos-green-6)',
    borderLeft: '1px solid var(--app-border-color)',
    borderRight: '1px solid var(--app-border-color)',
    borderTop: '1px solid var(--app-border-color)',
    borderRadius: '6px 6px 0 0',
    textAlign: 'center' as const,
    verticalAlign: 'middle',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  }),
  calorieFooterRow: (isDark: boolean) => ({
    backgroundColor: isDark ? 'rgba(35, 139, 80, 0.15)' : 'rgba(35, 139, 80, 0.08)',
    borderTop: '3px solid var(--mantine-color-nutroos-green-6)'
  }),
  tableStyles: {
    width: '100%', 
    borderCollapse: 'separate' as const, 
    borderSpacing: '4px 2px',
    tableLayout: 'fixed' as const,
    maxWidth: '1400px',
    margin: '0 auto'
  },
  calorieCellStyle: (isDark: boolean) => ({
    padding: '10px 12px', 
    textAlign: 'right' as const,
    fontWeight: 'bold',
    color: isDark ? 'var(--mantine-color-nutroos-green-4)' : 'var(--mantine-color-nutroos-green-7)',
    borderLeft: '1px solid var(--app-border-color)',
    borderRight: '1px solid var(--app-border-color)',
    borderBottom: '1px solid var(--app-border-color)',
    borderRadius: '0 0 8px 8px'
  }),
  emptyCell: {
    padding: '6px 4px', 
    borderBottom: '1px solid var(--app-border-color)',
    borderLeft: '1px solid var(--app-border-color)',
    borderRight: '1px solid var(--app-border-color)',
    verticalAlign: 'top'
  }
};

// Eliminamos la función renderLoadingState ya que requiere JSX y este es un archivo .ts
// Si necesitas UI components, mejor crear un archivo DietaUIComponents.tsx
