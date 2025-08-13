import { Response, NextFunction, Request } from "express";
import { RequestExt } from "../interfaces/req-ex";

export const checkRoleModerador = (
  req: RequestExt,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user;

  if (!user || typeof user !== "object") {
    res.status(403).send("No hay usuario en la solicitud");
    return;
  }

  const role = (user as any).role;

  if (typeof role !== "string") {
    res.status(403).send("Rol inválido");
    return;
  }

  if (role.toLowerCase() === "moderador") {
    next();
  } else {
    res.status(403).send("No tienes permisos para acceder a esta ruta");
  }
};
