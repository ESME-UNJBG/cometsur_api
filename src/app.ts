// app.ts

import "dotenv/config"; // Carga las variables de entorno del archivo .env
import express from "express"; // Framework para el servidor HTTP
import cors from "cors"; // Middleware para habilitar peticiones desde otros orígenes
import http from "http"; // Permite crear un servidor HTTP base para Socket.IO
import { Server as SocketServer } from "socket.io"; // Importa la clase principal de Socket.IO
import { router } from "./routes"; // Rutas REST (usuarios, listas, etc.)
import db from "./config/mongo"; // Conexión con MongoDB
import jwt, { JwtPayload } from "jsonwebtoken"; // <-- añadido para leer token

// 2️⃣ Configuración básica
const PORT = process.env.PORT || 3001;
const app = express();

// 3️⃣ Crear el servidor HTTP
const server = http.createServer(app);

// 4️⃣ Crear instancia de Socket.IO
// ⚠️ IMPORTANTE: en producción cambia "*" por el dominio de tu frontend (por seguridad)
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 5️⃣ Middlewares globales de Express
app.use(cors());
app.use(express.json());
app.use(router);

// 6️⃣ Conexión a MongoDB
db().then(() => console.log("✅ Conexión a MongoDB lista"));

// Helper pequeño: decodifica token y extrae _id y estado (si están)
const extractUserFromJwt = (token?: string | null) => {
  if (!token)
    return { id: null as string | null, estado: null as string | null };

  try {
    // jwt.verify puede devolver JwtPayload | string
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as
      | JwtPayload
      | string;

    if (!decoded) return { id: null, estado: null };

    if (typeof decoded === "string") {
      // caso raro: token decodificado como string -> tratamos como id fallback
      return { id: decoded, estado: null };
    }

    // Normal: objeto JwtPayload -> extraemos campos comunes
    const maybeId =
      (typeof decoded._id === "string" && decoded._id) ||
      (typeof decoded.id === "string" && decoded.id) ||
      (typeof decoded.sub === "string" && decoded.sub) ||
      null;

    const maybeEstado =
      (typeof decoded.estado === "string" && decoded.estado) ||
      (typeof decoded.role === "string" && decoded.role) ||
      null;

    return { id: maybeId, estado: maybeEstado };
  } catch (err) {
    // token inválido/expirado -> devolvemos nulls y seguimos con fallback
    return { id: null, estado: null };
  }
};

// 7️⃣ Configuración de Socket.IO
io.on("connection", (socket) => {
  // leemos token (si fue enviado en handshake) y userId (fallback)
  const handshakeUserId = socket.handshake.query.userId as string | undefined;
  const handshakeToken = socket.handshake.query.token as string | undefined;

  // intentamos extraer id y estado del token (si existe)
  const { id: tokenUserId, estado: tokenUserEstado } = extractUserFromJwt(
    handshakeToken ?? null
  );

  // Prioridad: usar id verificado desde token; si no, usar el userId enviado en handshake
  const userId = tokenUserId ?? handshakeUserId ?? null;
  const userEstado = tokenUserEstado ?? null;

  console.log(
    `🟢 Usuario conectado: ${userId ?? "desconocido"} | Socket ID: ${socket.id}`
  );

  // 📩 Escuchar mensajes desde el frontend
  socket.on("mensaje", (data) => {
    let texto: string;

    // Permitir tanto string como objeto
    if (typeof data === "string") {
      texto = data;
    } else if (data && typeof data === "object" && (data as any).texto) {
      texto = (data as any).texto;
    } else {
      console.warn("⚠️ Mensaje con formato inválido recibido:", data);
      return;
    }

    console.log(`💬 [${userId ?? "desconocido"}] dice: ${texto}`);

    // 🔁 Reenviar el mensaje a todos los usuarios conectados
    io.emit("mensaje", { userId, texto });
  });

  // 🔴 Evento de desconexión
  socket.on("disconnect", () => {
    console.log(`🔴 Usuario desconectado: ${userId ?? "desconocido"}`);
  });
});

// 8️⃣ Arranque del servidor HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
