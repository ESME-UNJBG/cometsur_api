import { Schema, Types, model, Model } from "mongoose";
import { User } from "../interfaces/user.interface";

//comprovacion de los tipos de entrada a analizar en la API
const UserSchema = new Schema<User>(
  {
    name: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    estado: {
      type: String,
      default: "usuario",
    },
    asistencia: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Aquí tipamos el modelo como Model<User>
const UserModel: Model<User> = model<User>("user", UserSchema);

// ¡Exporta el modelo directamente, no un objeto que lo contenga!
export default UserModel;
