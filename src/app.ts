// app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { router } from "./routes";
import db from "./config/mongo";

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*"; // en producción pon tu dominio
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(router);

db().then(() => console.log("✅ Conexión a MongoDB lista"));

// Socket.IO
io.on("connection", (socket) => {
  // handshake.query viene como strings (o objet); lo casteamos y validamos
  const handshakeUserId = (socket.handshake.query.userId as string) || null;
  const handshakeToken = (socket.handshake.query.token as string) || null;

  // Intentamos verificar token si viene
  let verifiedUserId: string | null = null;
  if (handshakeToken) {
    try {
      const payload = jwt.verify(handshakeToken, JWT_SECRET) as any;
      // asumo que tu token guarda el id en payload.id (ajusta si tu payload es distinto)
      verifiedUserId = payload.id ?? payload.userId ?? payload.sub ?? null;
    } catch (err) {
      console.warn("⚠️ Token inválido en handshake:", (err as Error).message);
      // No hacemos disconnect automático para no romper UX; solo no confiamos en token
      // Si prefieres forzar desconexión, podrías hacer: socket.disconnect();
    }
  }

  // Decidimos el userId que vamos a usar en el socket: prioridad al token verificado
  const attachedUserId = verifiedUserId || handshakeUserId || "anon";

  // Guardamos la identidad en socket.data (útil, seguro y persistente en la conexión)
  socket.data.userId = attachedUserId;

  console.log(
    `🟢 Conexión socket: id=${socket.id} | attachedUserId=${socket.data.userId}`
  );

  // Manejo de mensajes entrantes
  socket.on("mensaje", (data) => {
    // Normalizar el texto
    let texto: string = "";

    if (typeof data === "string") {
      texto = data;
    } else if (typeof data === "object" && data !== null) {
      // data puede ser { texto } o { userId, texto } (ignoramos userId enviado por cliente)
      texto =
        typeof (data as any).texto === "string" ? (data as any).texto : "";
    }

    if (!texto || texto.trim() === "") {
      console.warn("⚠️ Mensaje vacío o inválido recibido, se ignora.");
      return;
    }

    const mensajeEmitir = {
      userId: socket.data.userId,
      texto: texto.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log(`💬 [${socket.data.userId}] -> ${mensajeEmitir.texto}`);

    // Emitimos a todos (puedes adaptar: broadcast a salas, emitir solo a otros, etc.)
    io.emit("mensaje", mensajeEmitir);
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `🔴 Desconexión socket: id=${socket.id} | userId=${socket.data.userId} | reason=${reason}`
    );
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
