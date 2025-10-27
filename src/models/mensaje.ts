// src/models/Mensaje.ts
import mongoose, { Schema } from "mongoose";
import { IMensajeDocument } from "../interfaces/mensaje";

const MensajeSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "El ID de usuario es requerido"],
    },
    userName: {
      type: String,
      required: [true, "El nombre de usuario es requerido"],
      trim: true,
    },
    userEstado: {
      type: String,
      required: [true, "El estado de usuario es requerido"],
      enum: ["usuario", "moderador"],
      default: "usuario",
    },
    texto: {
      type: String,
      required: [true, "El texto del mensaje es requerido"],
      trim: true,
      maxlength: [500, "El mensaje no puede exceder 500 caracteres"],
    },
    tipo: {
      type: String,
      enum: ["general", "privado"],
      default: "general",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// 🎯 Índice TTL para auto-borrado después de expiresAt
MensajeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 🎯 Índices para búsquedas eficientes
MensajeSchema.index({ tipo: 1, timestamp: -1 });
MensajeSchema.index({ userId: 1, timestamp: -1 });

export const Mensaje = mongoose.model<IMensajeDocument>(
  "Mensaje",
  MensajeSchema
);
