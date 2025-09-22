# Optimización de Imágenes para Stream.io

## Problema

Stream.io tiene un límite de 5KB para los datos personalizados del usuario (incluyendo la imagen de perfil). Cuando los usuarios suben imágenes grandes en formato base64, se produce el error:

```
PayloadTooBigError: user custom data cannot be bigger than 5KB
```

## Solución

Se implementó un sistema de optimización de imágenes que:

1. **Detecta imágenes grandes**: Verifica si una imagen base64 excede el límite de 5KB
2. **Optimiza automáticamente**: Redimensiona y comprime las imágenes que exceden el límite
3. **Mantiene la calidad**: Usa compresión inteligente para mantener una calidad aceptable
4. **Maneja errores**: Si la optimización falla, continúa sin imagen en lugar de fallar

## Archivos Creados

### `imageOptimizer.ts`
Utilidades principales para optimización:
- `optimizeImageForStream()`: Optimiza una imagen base64
- `isImageTooBigForStream()`: Verifica si una imagen excede el límite
- `getOptimizedImageForStream()`: Función principal que maneja URLs y base64

### `useImageOptimization.ts`
Hook personalizado para manejar la optimización:
- Estado de carga durante la optimización
- Manejo de errores
- Funciones reutilizables

### `ImageOptimizationNotification.tsx`
Componente de UI para mostrar el estado de optimización al usuario.

## Uso

```typescript
import { getOptimizedImageForStream } from '../utils/imageOptimizer';

// Optimizar imagen antes de enviar a Stream.io
const optimizedImage = await getOptimizedImageForStream(user.profilePicture);

// Usar en Stream.io
await client.connectUser({
  id: user._id,
  name: user.fullName,
  image: optimizedImage, // Imagen optimizada
}, token);
```

## Configuración

La optimización se configura con parámetros por defecto:
- **Tamaño máximo**: 150x150 píxeles
- **Calidad**: 0.7 (70%)
- **Formato de salida**: JPEG
- **Límite de tamaño**: 5KB

## Integración

El sistema está integrado automáticamente en:
- `VideoContext.tsx`: Optimiza la imagen antes de conectar a Stream.io
- Se aplica a todas las videollamadas sin cambios adicionales

## Beneficios

1. **Elimina el error PayloadTooBigError**
2. **Mejora el rendimiento** de las videollamadas
3. **Experiencia de usuario fluida** sin interrupciones
4. **Optimización automática** sin intervención del usuario
5. **Fallback robusto** si la optimización falla
