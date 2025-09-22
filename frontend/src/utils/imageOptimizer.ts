/**
 * Utilidades para optimizar imágenes antes de enviarlas a servicios externos
 */

/**
 * Optimiza una imagen base64 reduciendo su tamaño y calidad
 * @param base64String - La imagen en formato base64
 * @param maxWidth - Ancho máximo en píxeles (por defecto 150)
 * @param maxHeight - Alto máximo en píxeles (por defecto 150)
 * @param quality - Calidad de compresión (0-1, por defecto 0.7)
 * @returns Promise<string> - La imagen optimizada en base64
 */
export const optimizeImageForStream = async (
  base64String: string,
  maxWidth: number = 150,
  maxHeight: number = 150,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Si no es una imagen base64, devolver tal como está
      if (!base64String.startsWith('data:image/')) {
        resolve(base64String);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          // Calcular las nuevas dimensiones manteniendo la proporción
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Configurar el canvas con las nuevas dimensiones
          canvas.width = width;
          canvas.height = height;

          // Dibujar la imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con la calidad especificada
          const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          // Verificar que el tamaño no exceda 5KB (límite de Stream.io)
          const sizeInBytes = (optimizedBase64.length * 3) / 4; // Aproximación del tamaño en bytes
          const maxSizeBytes = 5 * 1024; // 5KB
          
          if (sizeInBytes > maxSizeBytes) {
            // Si aún es muy grande, reducir más la calidad
            const newQuality = Math.max(0.1, quality * 0.5);
            const newOptimizedBase64 = canvas.toDataURL('image/jpeg', newQuality);
            resolve(newOptimizedBase64);
          } else {
            resolve(optimizedBase64);
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = base64String;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Verifica si una imagen base64 excede el límite de tamaño de Stream.io (5KB)
 * @param base64String - La imagen en formato base64
 * @returns boolean - true si excede el límite, false en caso contrario
 */
export const isImageTooBigForStream = (base64String: string): boolean => {
  if (!base64String.startsWith('data:image/')) {
    return false;
  }
  
  const sizeInBytes = (base64String.length * 3) / 4; // Aproximación del tamaño en bytes
  const maxSizeBytes = 5 * 1024; // 5KB
  
  return sizeInBytes > maxSizeBytes;
};

/**
 * Obtiene una URL de imagen optimizada para Stream.io
 * Si la imagen es base64 y es muy grande, la optimiza
 * Si es una URL normal, la devuelve tal como está
 * @param imageUrl - URL o base64 de la imagen
 * @returns Promise<string> - URL optimizada para Stream.io
 */
export const getOptimizedImageForStream = async (imageUrl: string | null | undefined): Promise<string | undefined> => {
  if (!imageUrl) {
    return undefined;
  }

  // Si es una URL normal (no base64), devolver tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es base64 y es muy grande, optimizarla
  if (imageUrl.startsWith('data:image/') && isImageTooBigForStream(imageUrl)) {
    try {
      return await optimizeImageForStream(imageUrl);
    } catch (error) {
      console.warn('Error al optimizar imagen para Stream.io:', error);
      // Si falla la optimización, devolver undefined para no enviar imagen
      return undefined;
    }
  }

  // Si es base64 pero no es muy grande, devolver tal como está
  return imageUrl;
};
