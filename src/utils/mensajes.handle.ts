// src/utils/mensajes.handler.ts
import { Socket } from "socket.io";

/**
 * 🎯 Manejador de mensajes en tiempo real
 * 💬 Gestiona mensajes generales y privados
 * 📍 UBICACIÓN: utils/ (junto a otras utilidades)
 */
export class MensajesHandler {
  private connectedUsers = new Map();

  constructor() {
    this.connectedUsers = new Map();
    console.log("✅ [MENSAJES-HANDLER] Inicializado en utils/");
  }

  /**
   * 📩 Maneja mensajes generales (para todos en sala_general)
   */
  handleMensajeGeneral(socket: Socket, userData: any) {
    socket.on("mensaje", (data) => {
      console.log("💬 [MENSAJE] Recibido de:", userData.id);

      let texto: string;

      // ✅ Validar formato del mensaje
      if (typeof data === "string") {
        texto = data;
      } else if (data && typeof data === "object" && data.texto) {
        texto = data.texto;
      } else {
        console.warn("⚠️ [MENSAJE] Formato inválido:", data);
        socket.emit("error", { mensaje: "Formato de mensaje inválido" });
        return;
      }

      if (!texto.trim()) {
        socket.emit("error", { mensaje: "El mensaje no puede estar vacío" });
        return;
      }

      // ✅ Construir datos del mensaje
      const mensajeData = {
        id: Date.now().toString(),
        userId: userData.id,
        userEstado: userData.estado,
        texto: texto.trim(),
        timestamp: new Date().toISOString(),
        tipo: "general",
      };

      console.log(
        `📤 [MENSAJE] Enviando a sala_general: ${userData.id} → "${texto}"`
      );

      // ✅ Enviar a TODOS en la sala general
      socket.to("sala_general").emit("mensaje_general", mensajeData);

      // ✅ Confirmación al remitente
      socket.emit("mensaje_confirmado", {
        id: mensajeData.id,
        status: "entregado",
      });
    });
  }

  /**
   * 📨 Maneja mensajes privados entre usuarios
   */
  handleMensajePrivado(socket: Socket, userData: any) {
    socket.on("mensaje_privado", (data) => {
      if (!data.destino || !data.texto) {
        socket.emit("error", {
          mensaje: "Faltan datos: destino y texto son requeridos",
        });
        return;
      }

      console.log(`📨 [PRIVADO] ${userData.id} → ${data.destino}`);

      const mensajeData = {
        id: Date.now().toString(),
        remitenteId: userData.id,
        remitenteEstado: userData.estado,
        destinoId: data.destino,
        texto: data.texto,
        timestamp: new Date().toISOString(),
      };

      // ✅ Enviar al destinatario específico
      socket.to(`user_${data.destino}`).emit("mensaje_privado", mensajeData);

      // ✅ Confirmación al remitente
      socket.emit("mensaje_privado", {
        ...mensajeData,
        esPropio: true,
        status: "enviado",
      });
    });
  }

  /**
   * 👥 Registra usuario conectado
   */
  registerUser(socketId: string, userData: any) {
    this.connectedUsers.set(socketId, userData);
    console.log(`📊 [USUARIOS] Conectados: ${this.connectedUsers.size}`);
  }

  /**
   * 🚪 Elimina usuario desconectado
   */
  unregisterUser(socketId: string) {
    this.connectedUsers.delete(socketId);
    console.log(`📊 [USUARIOS] Conectados: ${this.connectedUsers.size}`);
  }

  /**
   * 📊 Obtiene estadísticas de conexiones
   */
  getStats() {
    return {
      totalConectados: this.connectedUsers.size,
      usuarios: Array.from(this.connectedUsers.values()).map((u) => ({
        id: u.id,
        estado: u.estado,
        socketId: u.socketId,
      })),
    };
  }
}
