import { sign, verify } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta";

const generateToken = (data: object) => {
  return sign(data, JWT_SECRET, { expiresIn: "2h" });
};

const verifyToken = (jwt: string) => {
  return verify(jwt, JWT_SECRET);
};

export { generateToken, verifyToken };
