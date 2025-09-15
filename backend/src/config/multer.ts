import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    const recipeId = req.params.recipeId || randomUUID();
    const recipePath = path.join(uploadsPath, 'recipes', recipeId);
    
    if (!fs.existsSync(recipePath)) {
      fs.mkdirSync(recipePath, { recursive: true });
    }
    
    cb(null, recipePath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // Máximo 5 imágenes
  }
});

export default upload;
