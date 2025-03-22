import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API corriendo...");
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
