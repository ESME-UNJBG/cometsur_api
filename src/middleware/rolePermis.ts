import { Response, NextFunction, Request } from "express";
import { RequestExt } from "../interfaces/req-ex";

// ✅ 1. COMPORTAMIENTO ORIGINAL EXACTO - SOLO moderador
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

  const userRole = (user as any).estado || (user as any).role;

  if (typeof userRole !== "string") {
    res.status(403).send("Rol inválido");
    return;
  }

  // ✅ COMPORTAMIENTO ORIGINAL: SOLO "moderador"
  if (userRole.toLowerCase() === "moderador") {
    next(); // ← SOLO moderadores pasan
  } else {
    res.status(403).send("No tienes permisos para acceder a esta ruta");
  }
};

// ✅ 2. NUEVO: Para admin (si lo necesitas después)
export const checkRoleAdmin = (
  req: RequestExt,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user;

  if (!user || typeof user !== "object") {
    res.status(403).send("No hay usuario en la solicitud");
    return;
  }

  const userRole = (user as any).estado || (user as any).role;

  if (typeof userRole !== "string") {
    res.status(403).send("Rol inválido");
    return;
  }

  // ✅ SOLO admin puede pasar
  if (userRole.toLowerCase() === "admin") {
    next();
  } else {
    res.status(403).send("Se requiere rol de administrador");
  }
};

// ✅ 3. NUEVO: Para múltiples roles (opcional)
export const checkRole = (allowedRoles: string[]) => {
  return (req: RequestExt, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || typeof user !== "object") {
      res.status(403).send("No hay usuario en la solicitud");
      return;
    }

    const userRole = (user as any).estado || (user as any).role;

    if (typeof userRole !== "string") {
      res.status(403).send("Rol inválido");
      return;
    }

    // ✅ Cualquiera de los roles permitidos puede pasar
    if (allowedRoles.includes(userRole.toLowerCase())) {
      next();
    } else {
      res.status(403).send("No tienes permisos para acceder a esta ruta");
    }
  };
};
