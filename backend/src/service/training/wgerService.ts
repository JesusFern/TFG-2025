import fetch from 'node-fetch';

const WGER_BASE = 'https://wger.de/api/v2';
const LANGUAGE_ID = 4; // Español

interface WgerExerciseInfo {
  id: number;
  category: {
    id: number;
    name: string;
  };
  muscles: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
  }>;
  muscles_secondary: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
  }>;
  equipment: Array<{
    id: number;
    name: string;
  }>;
  translations: Array<{
    id: number;
    name: string;
    description: string;
    language: number;
  }>;
  videos: Array<{
    id: number;
    video: string;
    is_main: boolean;
    duration: number;
    width: number;
    height: number;
  }>;
}

interface WgerApiResponse {
  results: WgerExerciseInfo[];
  count: number;
  next: string | null;
  previous: string | null;
}


// Mapeo de equipamientos de wger a nuestros equipamientos
const EQUIPMENT_MAPPING: Record<string, string> = {
  'Barbell': 'Barra',
  'Dumbbell': 'Mancuernas',
  'Kettlebell': 'Kettlebell',
  'Pull-up bar': 'Barra de dominadas',
  'Resistance band': 'Bandas de resistencia',
  'Bench': 'Banco',
  'Incline bench': 'Banco',
  'Gym mat': 'Ninguno',
  'Swiss Ball': 'Pelota medicinal',
  'SZ-Bar': 'Barra',
  'none (bodyweight exercise)': 'Peso corporal'
};

// Mapeo de músculos de wger a nuestros grupos musculares
const MUSCLE_MAPPING: Record<string, string> = {
  'Biceps brachii': 'Brazos',
  'Triceps brachii': 'Brazos',
  'Brachialis': 'Brazos',
  'Pectoralis major': 'Pecho',
  'Anterior deltoid': 'Hombros',
  'Trapezius': 'Hombros',
  'Latissimus dorsi': 'Espalda',
  'Rectus abdominis': 'Core',
  'Obliquus externus abdominis': 'Core',
  'Quadriceps femoris': 'Piernas',
  'Biceps femoris': 'Piernas',
  'Gluteus maximus': 'Glúteos',
  'Gastrocnemius': 'Pantorrillas',
  'Soleus': 'Pantorrillas',
  'Serratus anterior': 'Pecho'
};

let accessToken: string | null = null;

async function getAuthToken(): Promise<string> {
  if (accessToken) return accessToken;
  
  const username = process.env.WGER_USERNAME;
  const password = process.env.WGER_PASSWORD;
  
  if (!username || !password) {
    console.warn('WGER credentials not found, using unauthenticated requests');
    return '';
  }

  try {
    const response = await fetch(`${WGER_BASE}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username,
        password
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${response.status}`);
    }
    
    const data = await response.json() as { access: string };
    accessToken = data.access;
    return accessToken;
  } catch (error) {
    console.warn('Failed to authenticate with wger, using unauthenticated requests:', error);
    return '';
  }
}

async function fetchJson(url: string, useAuth = false): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  
  if (useAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function cleanHtmlDescription(html: string): string {
  if (!html) return '';
  
  // Remover tags HTML básicos de forma segura
  // Usar una regex más específica para evitar backtracking catastrófico
  const cleaned = html
    .replace(/<[^<>]*>/g, '') // Remove all HTML tags (más específico)
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Si la descripción es muy corta o vacía, devolver un mensaje por defecto
  if (cleaned.length < 10) {
    return 'Descripción no disponible en español.';
  }
  
  return cleaned;
}

function mapEquipment(wgerEquipment: string): string {
  return EQUIPMENT_MAPPING[wgerEquipment] || 'Ninguno';
}

function mapMuscles(wgerMuscles: Array<{name: string; name_en: string}>): string {
  // Buscar el primer músculo que tengamos mapeado
  for (const muscle of wgerMuscles) {
    const mappedMuscle = MUSCLE_MAPPING[muscle.name] || MUSCLE_MAPPING[muscle.name_en];
    if (mappedMuscle) {
      return mappedMuscle;
    }
  }
  
  // Si no encontramos ninguno mapeado, usar el primer músculo disponible
  if (wgerMuscles.length > 0) {
    return wgerMuscles[0].name_en || wgerMuscles[0].name;
  }
  
  return 'General';
}

function processWgerExercise(exercise: WgerExerciseInfo): {
  id: number;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
  videoUrl?: string;
} | null {
  // Buscar traducción en español
  const spanishTranslation = exercise.translations.find(t => t.language === LANGUAGE_ID);
  if (!spanishTranslation) {
    return null;
  }
  
  // Mapear equipamiento
  const mappedEquipment = exercise.equipment.length > 0 
    ? mapEquipment(exercise.equipment[0].name)
    : 'Ninguno';
  
  // Mapear músculos
  const allMuscles = [...exercise.muscles, ...exercise.muscles_secondary];
  const mappedMuscle = mapMuscles(allMuscles);
  
  // Obtener video principal si existe
  const mainVideo = exercise.videos.find(v => v.is_main);
  const videoUrl = mainVideo?.video || (exercise.videos.length > 0 ? exercise.videos[0].video : undefined);
  
  return {
    id: exercise.id,
    name: spanishTranslation.name,
    description: cleanHtmlDescription(spanishTranslation.description),
    category: exercise.category.name,
    muscles: [mappedMuscle],
    equipment: [mappedEquipment],
    videoUrl
  };
}

export async function searchWgerExercises(query: string, limit = 20): Promise<{
  id: number;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
  videoUrl?: string;
}[]> {
  try {
    // Buscar ejercicios usando exerciseinfo que incluye traducciones
    const exercisesResponse = await fetchJson(`${WGER_BASE}/exerciseinfo/?limit=100`) as WgerApiResponse;
    const exercises: WgerExerciseInfo[] = exercisesResponse.results || [];
    
    // Filtrar ejercicios que tengan traducción en español
    const spanishExercises = exercises.filter(exercise => 
      exercise.translations.some(translation => translation.language === LANGUAGE_ID)
    );
    
    // Filtrar por query en las traducciones en español
    const normalizedQuery = normalizeText(query);
    const filteredExercises = spanishExercises.filter(exercise => {
      const spanishTranslation = exercise.translations.find(t => t.language === LANGUAGE_ID);
      if (!spanishTranslation) return false;
      
      const normalizedName = normalizeText(spanishTranslation.name);
      const normalizedDescription = normalizeText(spanishTranslation.description || '');
      
      return normalizedName.includes(normalizedQuery) || 
             normalizedDescription.includes(normalizedQuery);
    }).slice(0, limit);
    
    // Procesar ejercicios filtrados
    const processedExercises = filteredExercises
      .map(exercise => processWgerExercise(exercise))
      .filter(Boolean) as Array<{
        id: number;
        name: string;
        description: string;
        category: string;
        muscles: string[];
        equipment: string[];
        videoUrl?: string;
      }>;
    
    return processedExercises;
    
  } catch (error) {
    console.error('Error searching wger exercises:', error);
    throw new Error('Error al buscar ejercicios en wger');
  }
}

export async function getWgerExerciseDetails(exerciseId: number): Promise<{
  id: number;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
  videoUrl?: string;
} | null> {
  try {
    // Obtener detalles del ejercicio usando exerciseinfo
    const exerciseResponse = await fetchJson(`${WGER_BASE}/exerciseinfo/${exerciseId}/`) as WgerExerciseInfo;
    const exercise: WgerExerciseInfo = exerciseResponse;
    
    return processWgerExercise(exercise);
    
  } catch (error) {
    console.error('Error getting wger exercise details:', error);
    return null;
  }
}
