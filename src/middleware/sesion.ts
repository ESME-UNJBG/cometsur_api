import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.handle";
import { RequestExt } from "../interfaces/req-ex";

const checkjwt = (req: RequestExt, res: Response, next: NextFunction) => {
  try {
    const jwtByUser = req.headers.authorization || "";

    // Corrección aquí: split por espacio, no por caracter vacío
    const jwt = jwtByUser.split(" ").pop(); // Cambiado split("") por split(" ")
    console.log(jwt);
    if (!jwt) {
      res.status(401).send("No se proporcionó token JWT");
      return;
    }

    const isUser = verifyToken(jwt) as { id: string; role: string }; // Eliminé los template literals que no son necesarios

    if (!isUser) {
      res.status(401).send("No tienes un JWT válido");
      return;
    }

    req.user = isUser;
    next();
  } catch (e) {
    console.error("Error en checkjwt:", e);
    res.status(400).send("Sesión no válida");
  }
};

export { checkjwt };
