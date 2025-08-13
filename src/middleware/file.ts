//src/middleware/file.ts
import multer from "multer";
import path from "path";

// Configuración simple de Multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../storage"), // Carpeta donde se guarda
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  },
});

// Middleware listo para usar
const multerMiddleware = multer({ storage });

export default multerMiddleware;
