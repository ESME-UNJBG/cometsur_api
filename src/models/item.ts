import { Schema, Types, model, Model } from "mongoose";
import { Car } from "../interfaces/car.interfaces";
//comprovacion de los tipos de entrada a analizar en la API
const ItemSchema = new Schema<Car>(
  {
    color: {
      type: String,
      required: true,
    },
    gas: {
      type: String,
      enum: ["gasoline", "electric"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Aquí tipamos el modelo como Model<Car>
const ItemModel: Model<Car> = model<Car>("items", ItemSchema);

// ¡Exporta el modelo directamente, no un objeto que lo contenga!
export default ItemModel;
