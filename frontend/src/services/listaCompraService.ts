import { apiClient } from './apiClient';

export interface IngredienteListaCompra {
  ingredienteId: string;
  nombre: string;
  pesoTotal: number;
  unidad: string;
  precioEstimado?: number;
  categoria?: string;
  fuente: 'Interna' | 'Openfoodfacts' | 'Trabajador';
}

export interface ListaCompraSemanal {
  semana: number;
  fechaInicio: string;
  fechaFin: string;
  diasIncluidos: number[];
  ingredientes: IngredienteListaCompra[];
  totalIngredientes: number;
  pesoTotal: number;
}

export interface ListaCompraSemanaResponse {
  dietaId: string;
  semana: ListaCompraSemanal;
}

class ListaCompraService {

  /**
   * Genera una lista de compra para una semana específica
   */
  async generarListaCompraSemana(dietaId: string, semana: number): Promise<ListaCompraSemanaResponse> {
    try {
      const response = await apiClient.get(`/lista-compra/${dietaId}/semana/${semana}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al generar lista de compra de la semana');
      }
    } catch (error) {
      console.error('Error al generar lista de compra de semana:', error);
      throw error;
    }
  }

  /**
   * Formatea el peso para mostrar en la interfaz
   */
  formatearPeso(peso: number, unidad: string = 'g'): string {
    if (peso >= 1000) {
      return `${(peso / 1000).toFixed(1)} kg`;
    }
    return `${peso} ${unidad}`;
  }

  /**
   * Agrupa ingredientes por categoría
   */
  agruparPorCategoria(ingredientes: IngredienteListaCompra[]): Record<string, IngredienteListaCompra[]> {
    return ingredientes.reduce((grupos, ingrediente) => {
      const categoria = ingrediente.categoria || 'Otros';
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(ingrediente);
      return grupos;
    }, {} as Record<string, IngredienteListaCompra[]>);
  }

  /**
   * Calcula el total de ingredientes únicos en una lista
   */
  calcularTotalIngredientes(ingredientes: IngredienteListaCompra[]): number {
    return ingredientes.length;
  }

  /**
   * Calcula el peso total de una lista de ingredientes
   */
  calcularPesoTotal(ingredientes: IngredienteListaCompra[]): number {
    return ingredientes.reduce((total, ingrediente) => total + ingrediente.pesoTotal, 0);
  }

  /**
   * Genera un resumen de la lista de compra
   */
  generarResumenLista(ingredientes: IngredienteListaCompra[]): {
    totalIngredientes: number;
    pesoTotal: number;
    categorias: string[];
    pesoPorCategoria: Record<string, number>;
  } {
    const categorias = [...new Set(ingredientes.map(ing => ing.categoria || 'Otros'))];
    const pesoPorCategoria = this.agruparPorCategoria(ingredientes);
    
    const pesoPorCategoriaCalculado = Object.keys(pesoPorCategoria).reduce((acc, categoria) => {
      acc[categoria] = this.calcularPesoTotal(pesoPorCategoria[categoria]);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIngredientes: this.calcularTotalIngredientes(ingredientes),
      pesoTotal: this.calcularPesoTotal(ingredientes),
      categorias,
      pesoPorCategoria: pesoPorCategoriaCalculado
    };
  }
}

export const listaCompraService = new ListaCompraService();

