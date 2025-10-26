// 1️⃣ Importaciones necesarias

import "dotenv/config"; // Carga las variables de entorno del archivo .env
import express from "express"; // Framework para el servidor HTTP
import cors from "cors"; // Middleware para habilitar peticiones desde otros orígenes
import http from "http"; // Permite crear un servidor HTTP base para Socket.IO
import { Server as SocketServer } from "socket.io"; // Importa la clase principal de Socket.IO
import { router } from "./routes"; // Rutas REST (usuarios, listas, etc.)
import db from "./config/mongo"; // Conexión con MongoDB

// 2️⃣ Configuración básica
const PORT = process.env.PORT || 3001;
const app = express();

// 3️⃣ Crear el servidor HTTP
const server = http.createServer(app);

// 4️⃣ Crear instancia de Socket.IO
// Aquí definimos de dónde puede conectarse el cliente (React, por ejemplo)
const io = new SocketServer(server, {
  cors: {
    origin: "*", // 👈 Por ahora dejamos acceso libre; en producción se debe poner tu dominio React
    methods: ["GET", "POST"],
  },
});

// 5️⃣ Middlewares globales de Express
app.use(cors());
app.use(express.json());
app.use(router);

// 6️⃣ Conexión a MongoDB
db().then(() => console.log("✅ Conexión a MongoDB lista"));

// 7️⃣ Configuración de Socket.IO
io.on("connection", (socket) => {
  // 🔹 Extraemos los datos del usuario desde la conexión
  const userId = socket.handshake.query.userId;
  const token = socket.handshake.query.token;

  console.log(`🟢 Usuario conectado: ${userId} | Socket ID: ${socket.id}`);

  // 📩 Escuchar mensajes enviados desde el frontend
  socket.on("mensaje", (texto) => {
    console.log(`💬 [${userId}] dice: ${texto}`);

    // 🔁 Reenviar el mensaje a todos los usuarios conectados
    io.emit("mensaje", { userId, texto });
  });

  // 🔴 Evento de desconexión
  socket.on("disconnect", () => {
    console.log(`🔴 Usuario desconectado: ${userId}`);
  });
});

// 8️⃣ Arranque del servidor HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
