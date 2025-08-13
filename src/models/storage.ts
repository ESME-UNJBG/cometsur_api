import { Schema, Types, model, Model } from "mongoose";
import { Storage } from "../interfaces/Storage";
//comprovacion de los tipos de entrada a analizar en la API
const StorageSchema = new Schema<Storage>(
  {
    fileName: {
      type: String,
    },
    idUser: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Aquí tipamos el modelo como Model<User>
const StorageModel: Model<Storage> = model<Storage>("storage", StorageSchema);

// ¡Exporta el modelo directamente, no un objeto que lo contenga!
export default StorageModel;
