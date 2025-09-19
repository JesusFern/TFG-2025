// Configuración de Stream.io
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiSecret) {
  console.warn('STREAM_API_SECRET no está configurado. Los tokens no se generarán correctamente.');
}

export { apiKey, apiSecret };
