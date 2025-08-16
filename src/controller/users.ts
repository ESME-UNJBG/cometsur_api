import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { GetUsers, DeletUser, UpdateUser, GetUser } from "../services/users";

const getUser = async ({ params }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await GetUser(id);
    const data = response ? response : "Not_Usuario";
    res.send(data);
  } catch (e) {
    handleHttp(res, "ERROR_GET_ITEM");
  }
};
//muetra todos los usuarios
const getUsers = async (req: Request, res: Response) => {
  try {
    const response = await GetUsers();
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_ITEMS");
  }
};
//actualiza un usuario
const updateUser = async ({ params, body }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await UpdateUser(id, body);
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_UPDATEITEM");
  }
};
//elimina un usuario
const deleteUser = async ({ params }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await DeletUser(id);
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_DELETEITEM");
  }
};

export { getUsers, updateUser, deleteUser, getUser };
