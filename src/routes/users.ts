import { Router, Request, Response } from "express";
import { deleteUser, getUsers, updateUser, getUser } from "../controller/users";
import { checkRoleModerador } from "../middleware/rolePermis";
import { checkjwt } from "../middleware/sesion";
const router = Router();
router.get("/", checkjwt, checkRoleModerador, getUsers); //ruta que resive muchos usuarios
router.put("/:id", checkjwt, checkRoleModerador, updateUser); //ruta que actualiza un usuario
router.delete("/:id", checkjwt, checkRoleModerador, deleteUser); //ruta que elimina un usuario
router.get("/:id", checkjwt, getUser);
export { router };
