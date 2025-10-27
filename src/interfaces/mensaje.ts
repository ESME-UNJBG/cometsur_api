// src/interfaces/Mensaje.ts
import { Document } from "mongoose";

export interface IMensaje {
  _id?: string; // 🆔 ID de MongoDB (opcional para nuevos mensajes)
  userId: string; // 👤 ID del usuario que envió el mensaje
  userName: string; // 🏷️ Nombre real del usuario
  userEstado: string; // 📊 Estado/rol del usuario (usuario/moderador)
  texto: string; // 💬 Contenido del mensaje
  tipo: string; // 🏷️ Tipo de mensaje (general/privado)
  timestamp: Date; // ⏰ Fecha y hora de envío
  expiresAt: Date; // ⏳ Fecha de expiración (auto-borrado)
}

// 🎯 Para crear nuevos mensajes (sin _id)
export interface IMensajeInput {
  userId: string; // 👤 ID del usuario (requerido)
  userName: string; // 🏷️ Nombre real (requerido)
  userEstado: string; // 📊 Estado (requerido)
  texto: string; // 💬 Texto (requerido)
  tipo?: string; // 🏷️ Tipo (opcional, default: "general")
  timestamp?: Date; // ⏰ Timestamp (opcional, auto-generado)
  expiresAt?: Date; // ⏳ Expiración (opcional, auto-generado)
}

// 🎯 Para documentos de Mongoose - CORREGIDO: Exportar y extender Document
export interface IMensajeDocument extends Document {
  userId: string;
  userName: string;
  userEstado: string;
  texto: string;
  tipo: string;
  timestamp: Date;
  expiresAt: Date;
}
