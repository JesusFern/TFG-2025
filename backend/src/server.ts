import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import userRoutes from "./routes/users/userRoutes";
import workerRoutes from './routes/users/workerRoutes';
import dietRoutes from './routes/diets/dietRoutes';
import trainingRoutes from './routes/training';
import messagingRoutes from './routes/chats';
import { SocketServer } from './socket/socketServer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware global para debuggear TODAS las peticiones
app.use((req, res, next) => {
  console.log(`🌐 [${req.method}] ${req.originalUrl}`);
  console.log('  - Headers:', req.headers);
  console.log('  - Params:', req.params);
  console.log('  - Query:', req.query);
  next();
});

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP para Socket.IO
const httpServer = createServer(app);

const mongoUri = process.env.NODE_ENV === 'test' 
  ? process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nutroos_test'
  : process.env.MONGO_URI || 'mongodb://localhost:27017/nutroos';

if (!mongoUri) {
  console.error("Error: MONGO_URI no está definido en el archivo .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  });

app.use("/api/users", userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/messaging', messagingRoutes);

// Log de rutas registradas
console.log('🚀 Rutas registradas:');
console.log('  - /api/users');
console.log('  - /api/workers');
console.log('  - /api/diets');
console.log('  - /api/training');
console.log('  - /api/messaging');
console.log('    - /mensajes');
console.log('    - /conversaciones');
console.log('    - /notificaciones');

app.get("/", (req: Request, res: Response) => {
  res.send("API corriendo...");
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${req.method}] ${req.originalUrl} - Error: ${err.message}`);
  res.status(500).json({ message: err.message || "Error interno del servidor" });
  // Evita warning del linter por parámetro no usado manteniendo la firma de middleware de error
  void _next;
});

// Inicializar Socket.IO
const socketServer = new SocketServer(httpServer);

// Exportar para uso en tests o módulos externos
export { socketServer };

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log('Socket.IO inicializado y listo para conexiones WebSocket');
  });
}

export default app;