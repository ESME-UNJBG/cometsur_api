import { Storage } from "../interfaces/Storage";
import StorageModel from "../models/storage";
const registerUpload = async ({ fileName, idUser, path }: Storage) => {
  const responseIntem = await StorageModel.create({ fileName, idUser, path });
  return responseIntem;
};

export { registerUpload };
