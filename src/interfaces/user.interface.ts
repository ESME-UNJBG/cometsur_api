import { Auth } from "./auth.interface";

export interface User extends Auth {
  name: string;
  estado: string;
  asistencia: Number[];
  importe: Number;
  category: string;
  university: string;
  pago: string;
  baucher: string;
  profesion: string;
}
