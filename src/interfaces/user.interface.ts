import { Auth } from "./auth.interface";

export interface User extends Auth {
  name: string;
  estado: string;
  asistencia: Number;
  importe: string;
  category: string;
  university: string;
}
