import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Script para extraer información nutricional de alimentos desde el PDF TCA-2021
 * Páginas 15-96: Listado de alimentos con datos nutricionales
 */

const PDF_PATH = path.join(__dirname, '..', 'src', 'data', 'alimentos-cleaned.pdf');
const JSON_OUTPUT_FILE = path.join(__dirname, '..', 'data', 'alimentos_extraidos.json');

interface AlimentoTCA {
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
}

/**
 * Crea el directorio de salida si no existe
 */
async function crearDirectorioSalida(): Promise<void> {
  const dataDir = path.dirname(JSON_OUTPUT_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`📁 Directorio creado: ${dataDir}`);
  }
}

/**
 * Extrae número de un texto, manejando diferentes formatos
 * Devuelve 0 para valores nulos/vacíos en lugar de null
 */
function extraerNumero(texto: string): number {
  if (!texto || texto.trim() === '' || texto.trim() === '-' || texto.toLowerCase().includes('tr')) {
    return 0;
  }
  
  // Limpiar el texto y extraer números
  const numeroLimpio = texto
    .replace(/[^\d.,\-]/g, '') // Solo números, puntos, comas y guiones
    .replace(',', '.'); // Convertir comas a puntos
  
  const numero = parseFloat(numeroLimpio);
  return isNaN(numero) ? 0 : numero;
}

/**
 * Procesa una línea de texto para extraer información del alimento
 * Basado en el patrón observado: [Código] [Nombre] [Grupo] [Calorías] [Agua] [Proteínas] [Grasas] [Carbohidratos]...
 */
function procesarLineaAlimento(linea: string): AlimentoTCA | null {
  // Buscar líneas que empiecen con código de alimento (6 dígitos) según el formato real
  const match = linea.match(/^(\d{6})\s+(.+)/);
  if (!match) {
    return null;
  }

  const resto = match[2];

  // Dividir el resto por espacios, manteniendo números decimales con coma
  const partes = resto.split(/\s+/).filter(parte => parte.trim().length > 0);

  if (partes.length < 10) {
    return null; // Necesitamos suficientes columnas según el formato real
  }

  // Según el formato mostrado:
  // 010101 Arroz 1 364 9,4 0 6,7 81,6 81,4 0,16 0 1,4 0,9 0,19 0,23 0,32...
  // [código] [nombre] [grupo] [calorías] [agua] [alcohol] [proteínas] [carbohidratos] [almidón] [azúcares] [azúcares_libres] [fibra] [grasa_total]...

  // Extraer el nombre (primera parte alfabética)
  let nombre = '';
  let indiceNumeros = 0;

  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i];

    // Si es un número (incluye grupo), hemos llegado a los datos nutricionales
    if (/^\d+([.,]\d+)?$/.test(parte) || parte === '0') {
      indiceNumeros = i;
      break;
    }

    // Si contiene letras, es parte del nombre
    if (/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(parte)) {
      if (nombre) nombre += ' ';
      nombre += parte;
    }
  }

  if (!nombre || indiceNumeros === 0) {
    return null;
  }

  // Extraer valores según el formato real:
  // [0] grupo, [1] calorías, [2] agua, [3] alcohol, [4] proteínas, [5] carbohidratos, [6] almidón, [7] azúcares, [8] azúcares_libres, [9] fibra, [10] grasa_total
  const valores = partes.slice(indiceNumeros);

  if (valores.length < 11) {
    return null; // Necesitamos al menos hasta grasa_total
  }

  const calorias = extraerNumero(valores[1]);        // Posición 1: calorías
  const proteinas = extraerNumero(valores[4]);       // Posición 4: proteínas
  const hidratosCarbono = extraerNumero(valores[5]); // Posición 5: carbohidratos totales
  const grasas = extraerNumero(valores[10]);         // Posición 10: grasa total
  
  // Validar que tenemos datos básicos válidos
  if (nombre.length > 2 && calorias >= 0) {
    return {
      nombre: nombre.trim(),
      calorias,
      proteinas,
      grasas,
      hidratosCarbono
    };
  }
  
  return null;
}



/**
 * Extrae todas las líneas del PDF y las procesa secuencialmente
 */
async function extraerTodasLasLineas(): Promise<AlimentoTCA[]> {
  console.log(`📖 Leyendo PDF limpio: ${PDF_PATH}`);
  
  try {
    const pdfBuffer = await fs.readFile(PDF_PATH);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log(`📊 PDF cargado: ${pdfData.numpages} páginas totales`);
    console.log(`🎯 Procesando todo el contenido del PDF línea por línea`);
    
    const lineas = pdfData.text.split('\n');
    console.log(`📚 Total de líneas: ${lineas.length}`);
    
    const alimentosEncontrados: AlimentoTCA[] = [];
    
    console.log('🔍 Buscando alimentos con códigos de 6 dígitos...');
    
    lineas.forEach((linea) => {
      const alimento = procesarLineaAlimento(linea);
      if (alimento) {
        alimentosEncontrados.push(alimento);
        
        // Mostrar progreso cada 100 alimentos
        if (alimentosEncontrados.length % 100 === 0) {
          console.log(`📊 Procesados: ${alimentosEncontrados.length} alimentos...`);
        }
      }
    });
    
    console.log(`✅ Procesamiento completado: ${alimentosEncontrados.length} alimentos encontrados`);
    return alimentosEncontrados;
    
  } catch (error) {
    console.error('❌ Error leyendo PDF:', error);
    throw new Error(`No se pudo leer el archivo PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Guarda los alimentos extraídos en formato JSON
 */
async function guardarResultados(alimentos: AlimentoTCA[]): Promise<void> {
  console.log(`💾 Guardando ${alimentos.length} alimentos en formato JSON...`);
  
  // Limpiar datos: quitar el campo pagina y asegurar estructura consistente
  const alimentosLimpios = alimentos.map(alimento => ({
    nombre: alimento.nombre,
    calorias: alimento.calorias,
    proteinas: alimento.proteinas,
    grasas: alimento.grasas,
    hidratosCarbono: alimento.hidratosCarbono
  }));
  
  // Guardar solo archivo JSON
  await fs.writeFile(JSON_OUTPUT_FILE, JSON.stringify(alimentosLimpios, null, 2), 'utf-8');
  
  console.log(`✅ Archivo guardado: ${JSON_OUTPUT_FILE}`);
}

/**
 * Función principal
 */
async function extraerAlimentosPDF(): Promise<void> {
  console.log('🚀 Iniciando extracción de alimentos del PDF TCA-2021...');
  
  try {
    await crearDirectorioSalida();
    
    // Verificar que el PDF existe
    try {
      await fs.access(PDF_PATH);
    } catch {
      throw new Error(`No se encontró el archivo PDF en: ${PDF_PATH}`);
    }
    
    // Extraer todos los alimentos del PDF línea por línea
    const todosLosAlimentos = await extraerTodasLasLineas();
    
    if (todosLosAlimentos.length === 0) {
      console.warn('⚠️ No se encontraron alimentos en las páginas especificadas');
      console.log('🔍 Esto puede deberse a:');
      console.log('   - Formato del PDF diferente al esperado');
      console.log('   - Páginas que no contienen tablas de alimentos');
      console.log('   - Necesidad de ajustar los patrones de extracción');
    } else {
      await guardarResultados(todosLosAlimentos);
      
      console.log('\n🎉 EXTRACCIÓN COMPLETADA EXITOSAMENTE:');
      console.log(`   🍎 Total de alimentos: ${todosLosAlimentos.length}`);
      console.log(`   📁 Archivo generado: ${JSON_OUTPUT_FILE}`);
    }
    
  } catch (error) {
    console.error('💥 Error durante la extracción:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  extraerAlimentosPDF().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export { extraerAlimentosPDF, AlimentoTCA };
