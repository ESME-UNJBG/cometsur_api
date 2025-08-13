import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import {
  InterItem,
  GetItems,
  GetItem,
  UpdateItem,
  DeletItem,
} from "../services/item";
//agarra un solo item
const getItem = async ({ params }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await GetItem(id);
    const data = response ? response : "Not_found";
    res.send(data);
  } catch (e) {
    handleHttp(res, "ERROR_GET_ITEM");
  }
};
//agarra muchos items
const getItems = async (req: Request, res: Response) => {
  try {
    const response = await GetItems();
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_ITEMS");
  }
};
//Actualiza un item
const updateItem = async ({ params, body }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await UpdateItem(id, body);
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_UPDATEITEM");
  }
};
//Insertar item
const postItem = async ({ body }: Request, res: Response) => {
  try {
    //QUE DATOS VOY A RESIVIR ??
    const responseItem = await InterItem(body);
    res.send(responseItem);
  } catch (e) {
    handleHttp(res, "ERROR_GET_POSTITEM", e);
  }
};
//eliminar item
const deleteItem = async ({ params }: Request, res: Response) => {
  try {
    const { id } = params;
    const response = await DeletItem(id);
    res.send(response);
  } catch (e) {
    handleHttp(res, "ERROR_GET_DELETEITEM");
  }
};

export { getItem, getItems, updateItem, postItem, deleteItem };
