// interfaces/req-ex.ts
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { TokenPayload } from "./token.interface"; // ✅ Importamos nuestra interfaz

export interface RequestExt extends Request {
  user?:
    | JwtPayload
    | TokenPayload
    | {
        id?: string; // ← Opcional para compatibilidad
        role?: string; // ← Opcional para compatibilidad
      };
}

// EXPLICACIÓN: Ahora RequestExt puede ser:
// - JwtPayload (con todos los campos estándar)
// - TokenPayload (nuestra interfaz específica)
// - Un objeto con id/role (para compatibilidad con código legacy)
