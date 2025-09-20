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

// Estilos comunes para las vistas de dietas con colores elegantes y suaves
export const dietaStyles = {
  paperBg: { backgroundColor: 'var(--app-paper-bg)' },
  paperBorder: { borderColor: 'var(--app-border-color)' },
  borderBottom: { borderBottom: '1px solid var(--app-border-color)' },
  
  greenBg: (isDark: boolean) => ({ 
    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.04)' : 'rgba(148, 163, 184, 0.02)'
  }),
  greenBgDarker: (isDark: boolean) => ({ 
    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.06)' : 'rgba(148, 163, 184, 0.03)'
  }),
  
  cellBorders: {
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
    borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
    borderRight: '1px solid rgba(148, 163, 184, 0.12)'
  },
  greenBorder: { borderBottom: '1px solid rgba(148, 163, 184, 0.15)' },
  
  mealTitle: (isDark: boolean) => ({
    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.04)' : 'rgba(148, 163, 184, 0.02)',
    borderRadius: '6px',
    display: 'inline-block',
    width: '100%',
    borderLeft: '2px solid rgba(148, 163, 184, 0.2)',
    transition: 'all 0.2s ease'
  }),
  
  // Filas alternadas con colores muy sutiles
  rowBg: (isDark: boolean, isEven: boolean) => ({
    backgroundColor: isEven ? 
      (isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.005)') : 
      (isDark ? 'rgba(255, 255, 255, 0.005)' : 'rgba(0, 0, 0, 0.002)')
  }),
  
  // Encabezados de tabla con gradientes
  tableHeader: (isDark: boolean, isMobile: boolean = false) => ({
    width: `${100 / 7}%`,
    padding: isMobile ? '12px 8px' : '14px 12px',
    minWidth: isMobile ? '120px' : '180px',
    background: isDark 
      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.06) 0%, rgba(148, 163, 184, 0.03) 100%)'
      : 'linear-gradient(135deg, rgba(148, 163, 184, 0.04) 0%, rgba(148, 163, 184, 0.02) 100%)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
    borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
    borderRight: '1px solid rgba(148, 163, 184, 0.12)',
    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '8px 8px 0 0',
    textAlign: 'center' as const,
    verticalAlign: 'middle',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
  }),
  
  // Fila de calorías con estilo neutro elegante
  calorieFooterRow: (isDark: boolean) => ({
    background: isDark 
      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.06) 0%, rgba(148, 163, 184, 0.03) 100%)'
      : 'linear-gradient(135deg, rgba(148, 163, 184, 0.04) 0%, rgba(148, 163, 184, 0.02) 100%)',
    borderTop: '1px solid rgba(148, 163, 184, 0.15)'
  }),
  
  // Estilos de tabla mejorados - responsive para móvil y desktop
  tableStyles: (isMobile: boolean = false) => ({
    width: '100%', 
    borderCollapse: 'separate' as const, 
    borderSpacing: isMobile ? '4px 2px' : '10px 5px', // Menos espaciado en móvil
    tableLayout: 'fixed' as const,
    maxWidth: isMobile ? '100%' : '1600px', // Sin límite en móvil, 1600px en desktop (reducido)
    margin: '0 auto',
    borderRadius: '12px',
    overflow: isMobile ? 'auto' : 'hidden' // Scroll horizontal en móvil
  }),
  
  // Celdas de calorías con estilo neutro elegante
  calorieCellStyle: (isDark: boolean) => ({
    padding: '12px 16px', 
    textAlign: 'right' as const,
    fontWeight: '600',
    color: isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(148, 163, 184, 0.7)',
    borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
    borderRight: '1px solid rgba(148, 163, 184, 0.12)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '0 0 8px 8px',
    fontSize: '0.9rem'
  }),
  
  // Celdas vacías con estilo suave - responsive
  emptyCell: (isMobile: boolean = false) => ({
    padding: isMobile ? '8px 6px' : '14px 12px', // Menos padding en móvil
    minWidth: isMobile ? '120px' : '180px', // Más compacto en desktop
    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
    borderLeft: '1px solid rgba(148, 163, 184, 0.08)',
    borderRight: '1px solid rgba(148, 163, 184, 0.08)',
    verticalAlign: 'top',
    backgroundColor: 'transparent'
  }),
  
  // Estilo para badges de estado neutros elegantes
  statusBadge: (isDark: boolean) => ({
    background: isDark 
      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(148, 163, 184, 0.06) 0%, rgba(148, 163, 184, 0.03) 100%)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '0.8rem',
    fontWeight: '500'
  }),
  
  // Estilos para detalles de días
  dayDetailCard: (isDark: boolean) => ({
    background: isDark 
      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.03) 0%, rgba(148, 163, 184, 0.01) 100%)'
      : 'linear-gradient(135deg, rgba(148, 163, 184, 0.02) 0%, rgba(148, 163, 184, 0.005) 100%)',
    border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '8px',
    padding: '12px',
    transition: 'all 0.2s ease'
  }),
  
  // Estilo para platos individuales
  plateCard: (isDark: boolean) => ({
    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.02)' : 'rgba(148, 163, 184, 0.005)',
    borderRadius: '6px',
    border: '1px solid rgba(148, 163, 184, 0.06)',
    transition: 'all 0.2s ease'
  })
};

// Eliminamos la función renderLoadingState ya que requiere JSX y este es un archivo .ts
// Si necesitas UI components, mejor crear un archivo DietaUIComponents.tsx
