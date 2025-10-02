import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import userRoutes from "./routes/users/userRoutes";
import adminRoutes from './routes/users/adminRoutes';
import dietRoutes from './routes/diets/dietRoutes';
import seguimientoRoutes from './routes/diets/seguimientoRoutes';
import recetaRoutes from './routes/diets/recetaRoutes';
import trainingRoutes from './routes/training';
import estadisticasRoutes from './routes/training/estadisticasRoutes';
import messagingRoutes from './routes/chats';
import notificacionRoutes from './routes/chats/notificacionRoutes';
import suscriptionPlanRoutes from './routes/suscriptionPlan/suscriptionPlanRoutes';
import assignmentRequestRoutes from './routes/assignmentRequests/assignmentRequestRoutes';
import videoRoutes from './routes/video';
import citasRoutes from './routes/citas';
import alimentosHibridoRoutes from './routes/alimentos/alimentosHibridoRoutes';
import ingredientesRoutes from './routes/alimentos/ingredientesRoutes';
import wgerRoutes from './routes/training/wgerRoutes';
import googleCalendarRoutes from './routes/google/calendarRoutes';
import listaCompraRoutes from './routes/listaCompraRoutes';
import valoracionRoutes from './routes/valoraciones/valoracionRoutes';
import { SocketServer } from './socket/socketServer';
import { cronNotificacionesService } from './service/notificaciones/cronNotificacionesService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

app.use('/uploads', express.static('uploads'));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/diets-seguimiento', seguimientoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/suscription-plans', suscriptionPlanRoutes);
app.use('/api/assignment-requests', assignmentRequestRoutes);
app.use('/api', videoRoutes);
app.use('/api', citasRoutes);
app.use('/api/alimentos', alimentosHibridoRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/wger', wgerRoutes);
app.use('/api/google', googleCalendarRoutes);
app.use('/api/lista-compra', listaCompraRoutes);
app.use('/api/valoraciones', valoracionRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API corriendo...");
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${req.method}] ${req.originalUrl} - Error: ${err.message}`);
  res.status(500).json({ message: err.message || "Error interno del servidor" });
  void _next;
});

// Inicializar Socket.IO
const socketServer = new SocketServer(httpServer);

// Función para obtener la instancia del SocketServer
export const getSocketServer = () => socketServer;

// Exportar para uso en tests o módulos externos
export { socketServer };

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log('Socket.IO inicializado y listo para conexiones WebSocket');
    
    // Iniciar servicio de cron jobs para notificaciones
    cronNotificacionesService.iniciar();
    console.log('Servicio de cron jobs de notificaciones iniciado');
  });
}

export default app;