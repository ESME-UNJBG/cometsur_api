// interfaces/token.interface.ts
export interface TokenPayload {
  _id: string; // ID de MongoDB
  estado: string; // Estado del usuario
}

export interface AuthToken {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    estado: string;
  };
}
