import axios from 'axios';
import logger from '../../utils/logger';

// Interface para nuestro formato de respuesta
export interface AlimentoOpenFoodFacts {
  id: string;
  nombre: string;
  marca?: string;
  categorias?: string;
  pais?: string;
  imagen?: string;
  informacionNutricional: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra?: number;
    azucares?: number;
    sal?: number;
    sodio?: number;
  };
  tamanoPorcion?: string;
  calificacionNutricional?: string;
  tiendas?: string;
}

// Tipo mínimo para productos devueltos por OpenFoodFacts utilizados en este helper
export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  categories?: string;
  countries?: string;
  countries_tags?: string[];
  image_url?: string;
  nutriments?: {
    ['energy-kcal_100g']?: number;
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  nutrition_grades?: string;
  stores?: string;
  _id?: string;
}

// Configuración para España
const OPENFOODFACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const OPENFOODFACTS_PRODUCT_URL = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Normaliza texto eliminando acentos y caracteres especiales para mejor coincidencia
 */
const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales con espacios
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
};

/**
 * Calcula la coincidencia entre el nombre del producto y el término de búsqueda
 * Retorna un puntaje de 0-1000 donde valores más altos = mayor prioridad
 * SISTEMA DE CAPAS: Cada capa tiene rangos de 100 puntos para evitar solapamientos
 */
const calcularCoincidenciaNombre = (nombreProducto: string, terminoBusqueda: string): number => {
  const nombre = normalizarTexto(nombreProducto);
  const termino = normalizarTexto(terminoBusqueda);
  
  // Si alguno está vacío, no hay coincidencia
  if (!nombre || !termino) return 0;
  
  const palabrasNombre = nombre.split(/\s+/).filter(p => p.length > 0);
  const palabrasTermino = termino.split(/\s+/).filter(p => p.length > 0);
  
  // ===== CAPA 1000: COINCIDENCIA EXACTA TOTAL =====
  if (nombre === termino) return 1000;
  
  // ===== CAPA 900: COINCIDENCIA EXACTA COMO PALABRA ÚNICA =====
  // Para búsquedas de una palabra: prioridad absoluta si el producto ES exactamente esa palabra
  if (palabrasTermino.length === 1 && palabrasNombre.length === 1) {
    const terminoUnico = palabrasTermino[0];
    if (palabrasNombre[0] === terminoUnico) {
      return 950; // "manzana" vs "manzana" = MÁXIMA PRIORIDAD
    }
  }
  
  // ===== CAPA 800: PRIMERA PALABRA EXACTA =====
  if (palabrasTermino.length === 1 && palabrasNombre.length > 0) {
    const terminoUnico = palabrasTermino[0];
    if (palabrasNombre[0] === terminoUnico) {
      // Penalizar ligeramente según el número de palabras adicionales
      const penalizacion = Math.min(palabrasNombre.length - 1, 50);
      return 850 - penalizacion; // 850-800: "manzana roja", "manzana deshidratada"
    }
  }
  
  // ===== CAPA 700: PALABRA EXACTA EN SEGUNDA POSICIÓN =====
  if (palabrasTermino.length === 1 && palabrasNombre.length > 1) {
    const terminoUnico = palabrasTermino[0];
    if (palabrasNombre[1] === terminoUnico) {
      return 750; // "zumo manzana", "compota manzana"
    }
  }
  
  // ===== CAPA 600: PALABRA EXACTA EN POSICIONES POSTERIORES =====
  if (palabrasTermino.length === 1) {
    const terminoUnico = palabrasTermino[0];
    for (let i = 2; i < palabrasNombre.length; i++) {
      if (palabrasNombre[i] === terminoUnico) {
        const penalizacion = (i - 2) * 10;
        return 650 - penalizacion; // Menos prioridad cuanto más lejos esté
      }
    }
  }
  
  // ===== CAPA 500: PALABRAS QUE COMIENZAN CON EL TÉRMINO =====
  if (palabrasTermino.length === 1) {
    const terminoUnico = palabrasTermino[0];
    
    // Primera palabra comienza con el término
    if (palabrasNombre[0].startsWith(terminoUnico)) {
      return 550; // "manzanas", "manzanilla"
    }
    
    // Otras palabras comienzan con el término
    for (let i = 1; i < palabrasNombre.length; i++) {
      if (palabrasNombre[i].startsWith(terminoUnico)) {
        const penalizacion = (i - 1) * 20;
        return 520 - penalizacion;
      }
    }
  }
  
  // ===== CAPA 400: MÚLTIPLES PALABRAS CONSECUTIVAS =====
  if (palabrasTermino.length > 1) {
    let palabrasConsecutivas = 0;
    for (let i = 0; i < Math.min(palabrasNombre.length, palabrasTermino.length); i++) {
      if (palabrasNombre[i] === palabrasTermino[i]) {
        palabrasConsecutivas++;
      } else {
        break;
      }
    }
    
    if (palabrasConsecutivas === palabrasTermino.length) {
      return 450; // Todas las palabras coinciden desde el inicio
    }
    
    if (palabrasConsecutivas > 0) {
      const porcentaje = palabrasConsecutivas / palabrasTermino.length;
      return 400 + (porcentaje * 40); // 400-440 puntos
    }
  }
  
  // ===== CAPA 300: TODAS LAS PALABRAS PRESENTES (NO CONSECUTIVAS) =====
  if (palabrasTermino.length > 1) {
    const palabrasEncontradas = palabrasTermino.filter(palabraTermino =>
      palabrasNombre.some(palabraNombre => 
        palabraNombre === palabraTermino || palabraNombre.startsWith(palabraTermino)
      )
    );
    
    if (palabrasEncontradas.length === palabrasTermino.length) {
      return 350; // Todas las palabras están pero no consecutivas
    }
    
    if (palabrasEncontradas.length > 0) {
      const porcentaje = palabrasEncontradas.length / palabrasTermino.length;
      return 300 + (porcentaje * 40); // 300-340 puntos
    }
  }
  
  // ===== CAPA 200: CONTIENE COMO SUBCADENA =====
  if (nombre.includes(termino)) return 250;
  
  // ===== CAPA 100: COINCIDENCIA PARCIAL DE CARACTERES =====
  const caracteresComunes = [...termino].filter(char => nombre.includes(char)).length;
  const porcentajeCaracteres = caracteresComunes / termino.length;
  
  if (porcentajeCaracteres >= 0.8) return 180;
  if (porcentajeCaracteres >= 0.6) return 150;
  if (porcentajeCaracteres >= 0.4) return 120;
  if (porcentajeCaracteres >= 0.2) return 100;
  
  return 0;
};

/**
 * Filtra y prioriza productos relevantes para España
 */
const filtrarYPriorizarProductos = (products: OpenFoodFactsProduct[], searchTerm: string): OpenFoodFactsProduct[] => {
  return products
    .filter(product => {
      // Filtrar solo productos que tengan información básica
      return product.product_name && 
             product.nutriments && 
             (product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g);
    })
    .sort((a, b) => {
      // **PRIORIDAD 1: Coincidencia exacta en el nombre (mejorada con normalización)**
      const nombreA = a.product_name_es || a.product_name || '';
      const nombreB = b.product_name_es || b.product_name || '';
      
      const coincidenciaA = calcularCoincidenciaNombre(nombreA, searchTerm);
      const coincidenciaB = calcularCoincidenciaNombre(nombreB, searchTerm);
      
      // **PRIORIDAD ABSOLUTA: Coincidencia exacta de nombres**
      // Con el nuevo sistema de capas, diferencias >50 puntos indican categorías diferentes
      if (Math.abs(coincidenciaA - coincidenciaB) > 50) {
        return coincidenciaB - coincidenciaA; // Mayor coincidencia primero
      }
      
      // Solo para coincidencias de la misma capa, considerar otros factores
      
      // **PRIORIDAD 2: Productos de España (pero no eliminar otros)**
      const esEspañolA = esProductoEspañol(a) ? 2 : 0;
      const esEspañolB = esProductoEspañol(b) ? 2 : 0;
      
      // **PRIORIDAD 3: Marcas españolas conocidas**
      const marcaEspañolaA = esMarcaEspañola(a.brands) ? 1 : 0;
      const marcaEspañolaB = esMarcaEspañola(b.brands) ? 1 : 0;
      
      // **PRIORIDAD 4: Productos disponibles en tiendas españolas**
      const tiendaEspañolaA = esTiendaEspañola(a.stores) ? 1 : 0;
      const tiendaEspañolaB = esTiendaEspañola(b.stores) ? 1 : 0;
      
      // Calcular puntuación total de "españolidad"
      const puntuacionA = esEspañolA + marcaEspañolaA + tiendaEspañolaA;
      const puntuacionB = esEspañolB + marcaEspañolaB + tiendaEspañolaB;
      
      if (puntuacionA !== puntuacionB) {
        return puntuacionB - puntuacionA; // Mayor puntuación primero
      }
      
      // **PRIORIDAD 5: Productos con marca conocida**
      const tieneMarcaA = a.brands ? 1 : 0;
      const tieneMarcaB = b.brands ? 1 : 0;
      
      if (tieneMarcaA !== tieneMarcaB) {
        return tieneMarcaB - tieneMarcaA;
      }
      
      // **PRIORIDAD 6: Calificación nutricional**
      const gradosNutricionalesOrden = ['a', 'b', 'c', 'd', 'e'];
      const gradoA = a.nutrition_grades ? gradosNutricionalesOrden.indexOf(a.nutrition_grades.toLowerCase()) : 999;
      const gradoB = b.nutrition_grades ? gradosNutricionalesOrden.indexOf(b.nutrition_grades.toLowerCase()) : 999;
      
      return gradoA - gradoB;
    });
};

/**
 * Verifica si un producto es de España
 */
const esProductoEspañol = (product: OpenFoodFactsProduct): boolean => {
  if (!product) return false;
  const tags = product.countries_tags ?? [];
  const countriesLower = product.countries?.toLowerCase() ?? '';
  
  return (
    tags.some((tag: string) => 
      tag.includes('spain') || 
      tag.includes('españa') || 
      tag.includes('es:')
    ) ||
    countriesLower.includes('españa') ||
    countriesLower.includes('spain')
  );
};

/**
 * Verifica si es una marca española conocida
 */
const esMarcaEspañola = (brands?: string): boolean => {
  if (!brands) return false;
  
  const marcasEspañolas = [
    'mercadona', 'hacendado', 'carrefour', 'dia', 'eroski', 'auchan',
    'elpozo', 'campofrío', 'oscar mayer', 'tulipán', 'flora', 'danone',
    'central lechera asturiana', 'pascual', 'kaiku', 'presidente',
    'gallo', 'sos', 'carbonell', 'koipe', 'ybarra',
    'cuétara', 'galletas gullón', 'marías', 'fontaneda',
    'cola cao', 'nocilla', 'valor', 'nestlé españa'
  ];
  
  const brandsLower = brands.toLowerCase();
  return marcasEspañolas.some(marca => brandsLower.includes(marca));
};

/**
 * Verifica si se vende en tiendas españolas
 */
const esTiendaEspañola = (stores?: string): boolean => {
  if (!stores) return false;
  
  const tiendasEspañolas = [
    'mercadona', 'carrefour', 'dia', 'eroski', 'auchan', 'alcampo',
    'hipercor', 'el corte inglés', 'lidl', 'aldi', 'supersol',
    'consum', 'gadis', 'caprabo', 'bonpreu', 'condis'
  ];
  
  const storesLower = stores.toLowerCase();
  return tiendasEspañolas.some(tienda => storesLower.includes(tienda));
};

/**
 * Convierte producto de OpenFoodFacts a nuestro formato
 */
const convertirProducto = (product: OpenFoodFactsProduct): AlimentoOpenFoodFacts => {
  const calorias = product.nutriments?.['energy-kcal_100g'] || 
                   (product.nutriments?.energy_100g ? product.nutriments.energy_100g / 4.184 : 0);

  return {
    id: product.code ?? product._id ?? '',
    nombre: product.product_name_es || product.product_name || 'Producto sin nombre',
    marca: product.brands,
    categorias: product.categories,
    pais: product.countries,
    imagen: product.image_url,
    informacionNutricional: {
      calorias: Math.round(calorias),
      proteinas: product.nutriments?.proteins_100g || 0,
      carbohidratos: product.nutriments?.carbohydrates_100g || 0,
      grasas: product.nutriments?.fat_100g || 0,
      fibra: product.nutriments?.fiber_100g,
      azucares: product.nutriments?.sugars_100g,
      sal: product.nutriments?.salt_100g,
      sodio: product.nutriments?.sodium_100g
    },
    tamanoPorcion: product.serving_size,
    calificacionNutricional: product.nutrition_grades?.toUpperCase(),
    tiendas: product.stores
  };
};

/**
 * Busca alimentos en OpenFoodFacts con filtrado para España
 */
export const buscarAlimentosOpenFoodFacts = async (
  nombre: string,
  page: number = 1,
  maxResults: number = 20
): Promise<{ 
  alimentos: AlimentoOpenFoodFacts[], 
  total: number, 
  pagina: number, 
  maxResultados: number, 
  hayMasResultados: boolean 
}> => {
  try {
    // Validar parámetros
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del alimento es requerido');
    }

    if (nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (maxResults > 100) {
      maxResults = 100; // Límite de OpenFoodFacts
    }

    if (maxResults < 1) {
      maxResults = 20;
    }

    logger.info('Buscando alimentos en OpenFoodFacts (priorizando España)', {
      nombre: nombre.trim(),
      page,
      maxResults,
      estrategia: 'Búsqueda híbrida: España primero, luego global'
    });

    // Realizar búsqueda híbrida: primero productos españoles, luego generales
    let todosLosProductos: OpenFoodFactsProduct[] = [];
    
    try {
      // Primera búsqueda: Solo productos españoles
      const responseEspana = await axios.get(OPENFOODFACTS_SEARCH_URL, {
        params: {
          search_terms: nombre.trim(),
          page,
          page_size: Math.min(maxResults * 3, 60),
          sort_by: 'popularity',
          action: 'process',
          json: 1,
          tagtype_0: 'countries',
          tag_contains_0: 'contains',
          tag_0: 'spain',
          fields: 'code,product_name,product_name_es,brands,categories,countries,countries_tags,image_url,nutriments,serving_size,nutrition_grades,stores'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Nutroos-App/1.0 (https://nutroos.com)',
          'Accept': 'application/json'
        }
      });
      
      if (responseEspana.data?.products) {
        todosLosProductos.push(...responseEspana.data.products);
      }
      
      // Si no hay suficientes productos españoles, hacer búsqueda general
      if (todosLosProductos.length < maxResults) {
        const responseGeneral = await axios.get(OPENFOODFACTS_SEARCH_URL, {
          params: {
            search_terms: nombre.trim(),
            page,
            page_size: Math.min(maxResults * 2, 40),
            sort_by: 'popularity',
            action: 'process',
            json: 1,
            fields: 'code,product_name,product_name_es,brands,categories,countries,countries_tags,image_url,nutriments,serving_size,nutrition_grades,stores'
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'Nutroos-App/1.0 (https://nutroos.com)',
            'Accept': 'application/json'
          }
        });
        
        if (responseGeneral.data?.products) {
          // Agregar productos que no estén ya en la lista
          const productosExistentes = new Set(todosLosProductos.map(p => p.code));
          const productosNuevos = (responseGeneral.data.products as OpenFoodFactsProduct[]).filter(
            (p: OpenFoodFactsProduct) => !productosExistentes.has(p.code)
          );
          todosLosProductos.push(...productosNuevos);
        }
      }
      
    } catch (searchError) {
      logger.error('Error en búsqueda híbrida, fallback a búsqueda simple', {
        error: searchError instanceof Error ? searchError.message : 'Error desconocido'
      });
      
      // Fallback: búsqueda simple
      const response = await axios.get(OPENFOODFACTS_SEARCH_URL, {
        params: {
          search_terms: nombre.trim(),
          page,
          page_size: Math.min(maxResults * 3, 100),
          sort_by: 'popularity',
          action: 'process',
          json: 1,
          fields: 'code,product_name,product_name_es,brands,categories,countries,countries_tags,image_url,nutriments,serving_size,nutrition_grades,stores'
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'Nutroos-App/1.0 (https://nutroos.com)',
          'Accept': 'application/json'
        }
      });
      
      todosLosProductos = response.data?.products || [];
    }

    const data = { products: todosLosProductos };

    if (!data.products || data.products.length === 0) {
      logger.info('No se encontraron alimentos en OpenFoodFacts', { nombre: nombre.trim() });
      return {
        alimentos: [],
        total: 0,
        pagina: page,
        maxResultados: maxResults,
        hayMasResultados: false
      };
    }

    // Filtrar y priorizar productos relevantes para España
    const productosFiltrados = filtrarYPriorizarProductos(data.products, nombre.trim());
    
    // Logging detallado de coincidencias para debug
    const top10ConCoincidencias = productosFiltrados.slice(0, 10).map(product => {
      const nombreProducto = product.product_name_es || product.product_name || '';
      const coincidencia = calcularCoincidenciaNombre(nombreProducto, nombre.trim());
      const esEspanol = esProductoEspañol(product);
      return {
        nombre: nombreProducto,
        coincidencia: coincidencia,
        marca: product.brands || 'Sin marca',
        esEspanol: esEspanol,
        pais: product.countries || 'Sin país'
      };
    });
    
    logger.info('Top 10 productos con puntajes de coincidencia', {
      terminoBusqueda: nombre.trim(),
      productos: top10ConCoincidencias
    });
    
    // Limitar al número solicitado
    const productosLimitados = productosFiltrados.slice(0, maxResults);

    // Convertir a nuestro formato
    const alimentos = productosLimitados.map(convertirProducto);

    logger.info('Búsqueda en OpenFoodFacts completada', {
      nombre: nombre.trim(),
      productosOriginales: data.products.length,
      productosFiltrados: productosFiltrados.length,
      encontrados: alimentos.length,
      total: todosLosProductos.length,
      pagina: page,
      maxResultados: maxResults,
      estrategia: 'Priorización por españolidad + calidad'
    });

    return {
      alimentos,
      total: alimentos.length, // Total de resultados filtrados
      pagina: page,
      maxResultados: maxResults,
      hayMasResultados: productosFiltrados.length > maxResults
    };

  } catch (error) {
    logger.error('Error al buscar alimentos en OpenFoodFacts', {
      nombre,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw new Error('Error al conectar con OpenFoodFacts. Inténtalo de nuevo.');
  }
};

/**
 * Obtiene detalles de un producto específico por código de barras
 */
export const obtenerProductoPorCodigo = async (codigo: string): Promise<AlimentoOpenFoodFacts> => {
  try {
    if (!codigo || codigo.trim().length === 0) {
      throw new Error('El código del producto es requerido');
    }

    logger.info('Obteniendo producto por código en OpenFoodFacts', { codigo });

    // Obtener producto por código de barras usando la API directa
    const response = await axios.get(`${OPENFOODFACTS_PRODUCT_URL}/${codigo.trim()}.json`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Nutrioos-App/1.0 (https://nutrioos.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.data.product) {
      throw new Error('Producto no encontrado');
    }

    const alimento = convertirProducto(response.data.product);

    logger.info('Producto obtenido correctamente', { 
      codigo, 
      nombre: alimento.nombre,
      marca: alimento.marca 
    });

    return alimento;

  } catch (error) {
    logger.error('Error al obtener producto por código', {
      codigo,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    throw new Error('Error al obtener el producto. Inténtalo de nuevo.');
  }
};
