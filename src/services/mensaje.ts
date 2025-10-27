// src/services/MensajeService.ts
import { Mensaje } from "../models/mensaje";
import { IMensaje, IMensajeInput } from "../interfaces/mensaje";

export class MensajeService {
  /**
   * 💾 Guarda un mensaje en la base de datos
   */
  static async guardarMensaje(mensajeData: IMensajeInput): Promise<IMensaje> {
    try {
      // 🎯 Calcular expiración (30 minutos desde ahora)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      const mensaje = new Mensaje({
        ...mensajeData,
        expiresAt,
        timestamp: mensajeData.timestamp || new Date(),
      });

      const mensajeGuardado = await mensaje.save();

      console.log(
        `💾 [MENSAJE] Guardado en BD: ${
          mensajeData.userName
        } - ${mensajeData.texto.substring(0, 50)}...`
      );

      // Convertir a objeto plano
      return {
        _id: mensajeGuardado._id.toString(),
        userId: mensajeGuardado.userId,
        userName: mensajeGuardado.userName,
        userEstado: mensajeGuardado.userEstado,
        texto: mensajeGuardado.texto,
        tipo: mensajeGuardado.tipo,
        timestamp: mensajeGuardado.timestamp,
        expiresAt: mensajeGuardado.expiresAt,
      };
    } catch (error) {
      console.error("❌ [MENSAJE] Error guardando mensaje:", error);
      throw new Error("No se pudo guardar el mensaje");
    }
  }

  /**
   * 📂 Obtiene mensajes recientes (últimos 30min)
   */
  static async obtenerMensajesRecientes(
    limit: number = 50
  ): Promise<IMensaje[]> {
    try {
      const mensajes = await Mensaje.find({
        tipo: "general",
        expiresAt: { $gt: new Date() }, // 🎯 Solo mensajes no expirados
      })
        .sort({ timestamp: 1 }) // 🎯 Más antiguos primero (orden cronológico)
        .limit(limit)
        .lean();

      console.log(
        `📂 [MENSAJE] Cargados ${mensajes.length} mensajes recientes`
      );

      return mensajes.map((mensaje) => ({
        _id: mensaje._id.toString(),
        userId: mensaje.userId,
        userName: mensaje.userName,
        userEstado: mensaje.userEstado,
        texto: mensaje.texto,
        tipo: mensaje.tipo,
        timestamp: mensaje.timestamp,
        expiresAt: mensaje.expiresAt,
      }));
    } catch (error) {
      console.error("❌ [MENSAJE] Error obteniendo mensajes:", error);
      return [];
    }
  }

  /**
   * 🗑️ Limpia mensajes expirados (backup por si el TTL falla)
   */
  static async limpiarMensajesExpirados(): Promise<number> {
    try {
      const result = await Mensaje.deleteMany({
        expiresAt: { $lte: new Date() },
      });

      if (result.deletedCount > 0) {
        console.log(
          `🧹 [MENSAJE] Limpiados ${result.deletedCount} mensajes expirados`
        );
      }

      return result.deletedCount;
    } catch (error) {
      console.error("❌ [MENSAJE] Error limpiando mensajes:", error);
      return 0;
    }
  }
}
