import { Auth } from "../interfaces/auth.interface";
import { User } from "../interfaces/user.interface";
import UserModel from "../models/user";
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle"; // 👈 correo de bienvenida

const registerNewUser = async ({ email, password, name }: User) => {
  const checkIs = await UserModel.findOne({ email });
  if (checkIs) return "Usuario ya existe :)";

  const passHash = await encrypt(password);
  const registerNewUser = await UserModel.create({
    email,
    password: passHash,
    name,
  });

  // 👇 Enviar correo de bienvenida con credenciales
  if (email && email.includes("@")) {
    await sendWelcomeEmail(email, name, email, password);
  }

  return registerNewUser;
};

const loginUser = async ({ email, password }: Auth) => {
  const checkIs = await UserModel.findOne({ email });
  if (!checkIs) return "No coinciden";

  const passwordHash = checkIs.password;
  const IsCorrect = await verified(password, passwordHash);
  if (!IsCorrect) return "contraseña incorrecta";

  const token = generateToken({ id: checkIs.email, role: checkIs.estado });
  const data = {
    token,
    user: checkIs,
  };

  return data;
};

export { registerNewUser, loginUser };
