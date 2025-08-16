import UserModel from "../models/user";
import { User } from "../interfaces/user.interface";
import { encrypt, verified } from "../utils/password.handle";

export const GetUser = async (id: string) => {
  const responseItem = await UserModel.findOne({ _id: id });
  return responseItem;
};

export const GetUsers = async () => {
  const responseItem = await UserModel.find({});
  return responseItem;
};
export const DeletUser = async (id: string) => {
  const responseItem = await UserModel.deleteOne({ _id: id });
  return responseItem;
};
export const UpdateUser = async (id: string, data: Partial<User>) => {
  // Si en la actualización viene una contraseña, la encriptamos antes
  if (data.password) {
    data.password = await encrypt(data.password);
  }

  const responseItem = await UserModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  return responseItem;
};
