// src/sockets/auth.socket.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

/**
 * 🎯 Extrae información del usuario desde el token JWT
 * 🔐 Seguridad: Verifica token y extrae datos seguros
 */
export const extractUserFromJwt = (token?: string | null) => {
  if (!token) {
    console.log("🔐 [SOCKET-AUTH] No hay token proporcionado");
    return { id: null, estado: null };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_super_secreta"
    ) as JwtPayload;

    console.log("🔍 [SOCKET-AUTH] Token decodificado:", {
      _id: decoded._id,
      estado: decoded.estado,
      id: decoded.id,
    });

    // ✅ Extraer ID (prioridad: _id → id → sub)
    const userId = decoded._id || decoded.id || decoded.sub || null;

    // ✅ Extraer estado (prioridad: estado → role)
    const userEstado = decoded.estado || decoded.role || null;

    return {
      id: userId,
      estado: userEstado,
    };
  } catch (err) {
    console.warn("❌ [SOCKET-AUTH] Token inválido:", err);
    return { id: null, estado: null };
  }
};

/**
 * 🎯 Autentica el socket y extrae datos del usuario
 * 🔐 Seguridad: Valida conexiones antes de procesar mensajes
 */
export const authenticateSocket = (socket: Socket) => {
  const handshakeToken =
    socket.handshake.auth.token ||
    (socket.handshake.query.token as string | undefined);

  console.log("🔐 [SOCKET-AUTH] Autenticando socket:", socket.id);
  console.log(
    "🔐 [SOCKET-AUTH] Token presente:",
    handshakeToken ? "✅ SI" : "❌ NO"
  );

  const { id: userId, estado: userEstado } = extractUserFromJwt(handshakeToken);

  if (!userId) {
    console.warn("⚠️ [SOCKET-AUTH] Socket rechazado - Sin usuario válido");
    socket.emit("error", { mensaje: "Autenticación requerida" });
    socket.disconnect();
    return null;
  }

  const userData = {
    id: userId,
    estado: userEstado,
    socketId: socket.id,
    authenticatedAt: new Date(),
  };

  console.log("✅ [SOCKET-AUTH] Usuario autenticado:", {
    userId: userData.id,
    estado: userData.estado,
    socketId: userData.socketId,
  });

  return userData;
};
