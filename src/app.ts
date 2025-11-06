// src/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { router } from "./routes";
import db from "./config/mongo";
import { configureSockets } from "./sockets";

const PORT = process.env.PORT || 3001;

// ✅ Cargar orígenes permitidos desde .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

const app = express();
const server = http.createServer(app);

// ✅ Configurar CORS para API REST
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("🚫 CORS bloqueado para:", origin);
        return callback(new Error("No permitido por CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight requests (OPTIONS)
app.options("*", cors());

// ✅ Configurar Socket.IO con CORS desde .env
const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Middlewares globales
app.use(express.json());
app.use(router);

// ✅ Conexión a MongoDB
db().then(() => console.log("✅ Conexión a MongoDB lista"));

// ✅ Configurar sockets
configureSockets(io);

// ✅ Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔌 Socket.IO configurado y organizado`);
  console.log("🌐 Orígenes permitidos:", allowedOrigins.join(", "));
});

export { app, io };
