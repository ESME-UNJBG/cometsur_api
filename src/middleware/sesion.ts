// middleware/sesion.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.handle";
import { RequestExt } from "../interfaces/req-ex";
import { TokenPayload } from "../interfaces/token.interface"; // ✅ Importamos

const checkjwt = (req: RequestExt, res: Response, next: NextFunction) => {
  try {
    const jwtByUser = req.headers.authorization || "";
    const jwt = jwtByUser.split(" ").pop();

    console.log(
      "🔐 [MIDDLEWARE] Token recibido:",
      jwt ? "✅ Presente" : "❌ Ausente"
    );

    if (!jwt) {
      console.log("❌ [MIDDLEWARE] No se proporcionó token JWT");
      res.status(401).send("No se proporcionó token JWT");
      return;
    }

    // ✅ Usamos nuestra interfaz específica
    const tokenData = verifyToken(jwt) as TokenPayload;
    console.log("👤 [MIDDLEWARE] Datos del token:", tokenData);

    if (!tokenData || !tokenData._id) {
      console.log("❌ [MIDDLEWARE] Token no contiene _id válido");
      res.status(401).send("No tienes un JWT válido");
      return;
    }

    // ✅ Asignamos usando nuestra interfaz
    req.user = tokenData; // ← ¡Simple y directo!

    console.log("✅ [MIDDLEWARE] Usuario asignado al request:", req.user);

    next();
  } catch (e) {
    console.error("💥 [MIDDLEWARE] Error verificando token:", e);
    res.status(400).send("Sesión no válida");
  }
};

export { checkjwt };
