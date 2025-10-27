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
const app = express();

// ✅ Crear servidor HTTP
const server = http.createServer(app);

// ✅ Configurar Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Middlewares globales
app.use(cors());
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
