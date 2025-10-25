import { Request, Response } from "express";
import { loginUser, registerNewUser } from "../services/auth.serv";

const registerCrtl = async ({ body }: Request, res: Response) => {
  const responseUser = await registerNewUser(body);
  res.send(responseUser);
};

const loginCrtl = async ({ body }: Request, res: Response) => {
  const { email, password } = body;
  const responseUser = await loginUser({ email, password });
  if (responseUser === "contraseña incorrecta") {
    res.status(403);
    res.send(responseUser);
  } else {
    res.send(responseUser);
    //console.log(responseUser);
  }
};

export { registerCrtl, loginCrtl };
