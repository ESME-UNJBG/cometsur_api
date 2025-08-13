import { Router } from "express";
import { getItems } from "../controller/orders";
import { checkjwt } from "../middleware/sesion";
//**esta ruta solo pueden acceder una sesion activa con un jt valido  */
const router = Router();
router.get("/", checkjwt, getItems);
export { router };
