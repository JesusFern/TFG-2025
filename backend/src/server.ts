import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users/userRoutes";
import workerRoutes from './routes/users/workerRoutes';
import dietRoutes from './routes/diets/dietRoutes';
import trainingRoutes from './routes/training';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // AUMENTADO: Límite de 50MB para imágenes
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // AUMENTADO: Límite para formularios

const PORT = process.env.PORT || 5000;

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

app.get("/", (req: Request, res: Response) => {
  res.send("API corriendo...");
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${req.method}] ${req.originalUrl} - Error: ${err.message}`);
  res.status(500).json({ message: err.message || "Error interno del servidor" });
  // Evita warning del linter por parámetro no usado manteniendo la firma de middleware de error
  void _next;
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
}

export default app;