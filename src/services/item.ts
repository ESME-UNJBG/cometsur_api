import ItemModel from "../models/item"; // ahora sí es un Model<Car>
import { Car } from "../interfaces/car.interfaces";

export const InterItem = async (item: Car) => {
  const responseInsert = await ItemModel.create(item);
  return responseInsert;
};

export const GetItems = async () => {
  const responseItem = await ItemModel.find({});
  return responseItem;
};

export const GetItem = async (id: string) => {
  const responseItem = await ItemModel.findOne({ _id: id });
  return responseItem;
};

export const UpdateItem = async (id: string, data: Car) => {
  const responseItem = await ItemModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });
  return responseItem;
};

export const DeletItem = async (id: string) => {
  const responseItem = await ItemModel.deleteOne({ _id: id });
  return responseItem;
};
