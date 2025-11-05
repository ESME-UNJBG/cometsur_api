// src/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { router } from "./routes";
import db from "./config/mongo";
import { configureSockets } from "./sockets"; // ✅ Import organizado

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // URL del frontend desde .env

const app = express();

// ✅ Crear servidor HTTP
const server = http.createServer(app);

// ✅ Configurar Socket.IO con CORS seguro
const io = new SocketServer(server, {
  cors: {
    origin: FRONTEND_URL, // solo se permite tu frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Middlewares globales
app.use(
  cors({
    origin: FRONTEND_URL, // cors para API REST también seguro
    credentials: true,
  })
);
app.use(express.json());
app.use(router);

// ✅ Conexión a MongoDB
db().then(() => console.log("✅ Conexión a MongoDB lista"));

// ✅ Configurar sockets (CÓDIGO ORGANIZADO)
configureSockets(io);

// ✅ Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔌 Socket.IO configurado y organizado`);
});

export { app, io };
