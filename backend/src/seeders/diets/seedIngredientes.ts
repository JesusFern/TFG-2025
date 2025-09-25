import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import Ingrediente from '../../models/diets/ingrediente';

const JSON_FILE_PATH = path.join(__dirname, '..', '..', '..', 'data', 'alimentos_extraidos.json');
const BATCH_SIZE = 100; // Procesar en lotes para mejor rendimiento

interface AlimentoTCA {
  nombre: string;
  calorias: number;
  proteinas: number;
  grasas: number;
  hidratosCarbono: number;
}

function validarAlimento(alimento: AlimentoTCA): boolean {
  return !!(
    alimento.nombre && 
    typeof alimento.nombre === 'string' && 
    alimento.nombre.trim().length > 0 &&
    typeof alimento.calorias === 'number' && 
    alimento.calorias >= 0
  );
}

function transformarAlimento(alimento: AlimentoTCA) {
  return {
    nombre: alimento.nombre.trim(),
    calorias: alimento.calorias,
    proteinas: alimento.proteinas,
    grasas: alimento.grasas,
    hidratosCarbono: alimento.hidratosCarbono,
    fuente: 'Interna'
  };
}

async function cargarIngredientesDesdeJSON(): Promise<AlimentoTCA[]> {
  try {
    const contenido = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const alimentos: AlimentoTCA[] = JSON.parse(contenido);
    return alimentos;
  } catch (error) {
    console.error('❌ Error leyendo archivo JSON de ingredientes:', error);
    throw new Error(`No se pudo leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

interface MongoBulkWriteError {
  code?: number;
  insertedDocs?: unknown[];
}

async function procesarLote(alimentos: AlimentoTCA[], inicio: number, fin: number): Promise<{ insertados: number; omitidos: number }> {
  const lote = alimentos.slice(inicio, fin);
  let insertados = 0;
  let omitidos = 0;

  const alimentosValidos = [];
  for (const alimento of lote) {
    if (validarAlimento(alimento)) {
      alimentosValidos.push(transformarAlimento(alimento));
    } else {
      omitidos++;
    }
  }

  if (alimentosValidos.length === 0) {
    return { insertados: 0, omitidos };
  }

  try {
    const resultado = await Ingrediente.insertMany(alimentosValidos, { 
      ordered: false
    });
    insertados = resultado.length;
    
  } catch (error: unknown) {
    const err = error as MongoBulkWriteError;
    if (err.code === 11000) {
      insertados = Array.isArray(err.insertedDocs) ? err.insertedDocs.length : 0;
      const duplicadosOmitidos = alimentosValidos.length - insertados;
      omitidos += duplicadosOmitidos;
    } else {
      omitidos += alimentosValidos.length;
    }
  }

  return { insertados, omitidos };
}

export async function seedIngredientes(): Promise<void> {
  console.log('📊 Iniciando seed de ingredientes...');
  
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB no está conectado. Saltando seed de ingredientes.');
      return;
    }
    
    try {
      await fs.access(JSON_FILE_PATH);
    } catch {
      console.log('⚠️ Archivo JSON no encontrado. Ejecuta primero: npm run extract:pdf');
      console.log(`   Archivo esperado: ${JSON_FILE_PATH}`);
      return;
    }
    
    console.log('🧹 Limpiando ingredientes existentes...');
    const eliminados = await Ingrediente.deleteMany({});
    console.log(`🗑️ Eliminados ${eliminados.deletedCount} ingredientes existentes`);
    
    console.log(`📖 Leyendo archivo JSON: ${path.basename(JSON_FILE_PATH)}`);
    const alimentos = await cargarIngredientesDesdeJSON();
    console.log(`📊 Total de alimentos en archivo: ${alimentos.length}`);
    
    let totalInsertados = 0;
    let totalOmitidos = 0;
    
    console.log(`📦 Procesando en lotes de ${BATCH_SIZE} ingredientes...`);
    const totalLotes = Math.ceil(alimentos.length / BATCH_SIZE);
    
    for (let i = 0; i < totalLotes; i++) {
      const inicio = i * BATCH_SIZE;
      const fin = Math.min(inicio + BATCH_SIZE, alimentos.length);
      
      const resultado = await procesarLote(alimentos, inicio, fin);
      
      totalInsertados += resultado.insertados;
      totalOmitidos += resultado.omitidos;
      
      if ((i + 1) % 5 === 0 || i === totalLotes - 1) {
        console.log(`   📊 Lote ${i + 1}/${totalLotes} - Insertados: ${resultado.insertados}, Omitidos: ${resultado.omitidos}`);
      }
    }
    
    const totalEnDB = await Ingrediente.countDocuments({});
    
    console.log('✅ Seed de ingredientes completado:');
    console.log(`   📊 Total en JSON: ${alimentos.length}`);
    console.log(`   ✅ Insertados: ${totalInsertados}`);
    if (totalOmitidos > 0) {
      console.log(`   ⚠️ Omitidos: ${totalOmitidos}`);
    }
    console.log(`   📋 Total en BD: ${totalEnDB} ingredientes`);
    
  } catch (error) {
    console.error('❌ Error en seed de ingredientes:', error instanceof Error ? error.message : error);
    throw error;
  }
}
