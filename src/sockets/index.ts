// src/sockets/index.ts
import { Server as SocketServer } from "socket.io";
import { authenticateSocket } from "./auth.socket";
import { MensajesHandler } from "../utils/mensajes.handle"; // ✅ CORREGIDO

/**
 * 🎯 Configuración principal de Socket.IO
 * 🔌 Maneja todas las conexiones WebSocket
 */
export const configureSockets = (io: SocketServer) => {
  const mensajesHandler = new MensajesHandler();

  console.log("🔌 [SOCKETS] Configurando Socket.IO...");

  io.on("connection", async (socket) => {
    console.log("🟡 [SOCKETS] Nueva conexión:", socket.id);

    // ✅ 1. AUTENTICAR usuario
    const userData = authenticateSocket(socket);
    if (!userData) return;

    // ✅ 2. REGISTRAR usuario
    mensajesHandler.registerUser(socket.id, userData);

    // ✅ 3. UNIR a salas
    socket.join(`user_${userData.id}`);
    socket.join("sala_general");

    console.log(
      `🟢 [SOCKETS] Usuario unido a salas: user_${userData.id}, sala_general`
    );

    // 🆕 NUEVO: 4. CARGAR MENSAJES HISTÓRICOS (30 minutos)
    await mensajesHandler.cargarMensajesHistoricos(socket);

    // ✅ 5. CONFIGURAR manejadores
    mensajesHandler.handleMensajeGeneral(socket, userData);
    mensajesHandler.handleMensajePrivado(socket, userData);

    // ✅ 6. MANEJAR desconexión
    socket.on("disconnect", (reason) => {
      console.log(`🔴 [SOCKETS] Desconectado: ${userData.id} - ${reason}`);
      mensajesHandler.unregisterUser(socket.id);

      // Notificar a otros usuarios
      socket.to("sala_general").emit("usuario_desconectado", {
        userId: userData.id,
        disconnectedAt: new Date(),
      });
    });

    // ✅ 7. MANEJAR errores
    socket.on("error", (error) => {
      console.error("💥 [SOCKETS] Error:", error);
    });

    // ✅ 8. NOTIFICAR conexión exitosa
    socket.emit("conexion_establecida", {
      mensaje: "Conectado correctamente",
      userId: userData.id,
      salas: [`user_${userData.id}`, "sala_general"],
    });

    console.log(`✅ [SOCKETS] Configuración completada para: ${userData.id}`);
  });

  console.log("✅ [SOCKETS] Configuración de Socket.IO completada");

  return { mensajesHandler };
};
