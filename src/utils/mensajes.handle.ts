// src/utils/mensajes.handler.ts
import { Socket } from "socket.io";
import User from "../models/user"; // 🆕 NUEVO: Importar modelo User
import { MensajeService } from "../services/mensaje"; // 🆕 NUEVO: Importar servicio

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
    socket.on("mensaje", async (data) => {
      // 🆕 CAMBIO: Agregar async
      console.log("💬 [MENSAJE] Recibido de:", userData.id);

      let texto: string;

      // ✅ Validar formato del mensaje (código existente)
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

      try {
        // 🆕 NUEVO: Obtener usuario COMPLETO de la base de datos
        const usuario = await User.findById(userData.id);
        if (!usuario) {
          console.warn(
            "❌ [MENSAJE] Usuario no encontrado en BD:",
            userData.id
          );
          socket.emit("error", { mensaje: "Usuario no encontrado" });
          return;
        }

        // 🆕 NUEVO: Guardar mensaje en BD con nombre real
        const mensajeGuardado = await MensajeService.guardarMensaje({
          userId: userData.id,
          userName: usuario.name, // 🚀 NOMBRE REAL
          userEstado: userData.estado,
          texto: texto.trim(),
          tipo: "general",
        });

        console.log(
          `📤 [MENSAJE] Enviando a sala_general: ${usuario.name} (${userData.id}) → "${texto}"`
        );

        // ✅ Enviar a TODOS en la sala general (incluyendo al remitente)
        socket.to("sala_general").emit("mensaje_general", mensajeGuardado);

        // ✅ También enviar al remitente para confirmación inmediata
        socket.emit("mensaje_general", {
          ...mensajeGuardado,
          esPropio: true,
        });
      } catch (error) {
        console.error("❌ [MENSAJE] Error al procesar mensaje:", error);
        socket.emit("error", { mensaje: "Error interno del servidor" });
      }
    });
  }

  // 🆕 NUEVO MÉTODO: Cargar mensajes históricos al conectar
  async cargarMensajesHistoricos(socket: Socket) {
    try {
      const mensajesRecientes = await MensajeService.obtenerMensajesRecientes();
      socket.emit("mensajes_historicos", mensajesRecientes);
      console.log(
        `📂 [MENSAJE] Enviados ${mensajesRecientes.length} mensajes históricos a ${socket.id}`
      );
    } catch (error) {
      console.error("❌ [MENSAJE] Error cargando mensajes históricos:", error);
    }
  }

  // 🆕 NUEVO: Los demás métodos se mantienen IGUAL
  handleMensajePrivado(socket: Socket, userData: any) {
    // ... (código existente sin cambios)
  }

  registerUser(socketId: string, userData: any) {
    // ... (código existente sin cambios)
  }

  unregisterUser(socketId: string) {
    // ... (código existente sin cambios)
  }

  getStats() {
    // ... (código existente sin cambios)
  }
}
