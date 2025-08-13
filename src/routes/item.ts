import { Router, Request, Response } from "express";
import {
  deleteItem,
  getItem,
  getItems,
  postItem,
  updateItem,
} from "../controller/item";
import { logMiddleware } from "../middleware/log";
const router = Router();
//esta parte indica como se enruta l apeticion del usuario au http.......3002/items uso [GET]
router.get("/", getItems); //ruta que resive muchos items
router.get("/:id", logMiddleware, getItem); //ruta que un item
router.post("/", postItem); //ruta que sube muchos items
router.put("/:id", updateItem); //ruta que actualiza un item
router.delete("/:id", deleteItem); //ruta que elimina un item

export { router };
