import UserModel from "../models/user";
import { User } from "../interfaces/user.interface";
import { encrypt } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle";

/**
 * Obtener un usuario por id
 */
export const GetUser = async (id: string): Promise<User | null> => {
  const responseItem = await UserModel.findById(id).lean();
  return (responseItem as unknown as User) ?? null;
};

/**
 * Obtener todos los usuarios
 */
export const GetUsers = async (): Promise<User[]> => {
  const responseItem = await UserModel.find().lean();
  return responseItem as unknown as User[];
};

/**
 * Eliminar usuario por id
 */
export const DeletUser = async (id: string) => {
  const responseItem = await UserModel.deleteOne({ _id: id });
  return responseItem;
};

/**
 * Actualizar usuario.
 * Envía correo solo si cambia email o password.
 * Correos falsos no detienen la actualización.
 */
export const UpdateUser = async (
  id: string,
  data: Partial<User>
): Promise<User | null> => {
  const oldUserDoc = await UserModel.findById(id);
  if (!oldUserDoc) throw new Error("Usuario no encontrado");

  let plainPassword: string | undefined;
  let emailChanged = false;
  let passwordChanged = false;

  if (typeof data.email === "string" && data.email !== oldUserDoc.email) {
    emailChanged = true;
  }

  if (typeof data.password === "string" && data.password.length > 0) {
    plainPassword = data.password;
    data.password = await encrypt(data.password);
    passwordChanged = true;
  }

  const updatedUserDoc = await UserModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  if (!updatedUserDoc) return null;

  if (emailChanged || passwordChanged) {
    const passwordToSend = plainPassword ?? "Tu contraseña no ha sido modificada.";
    sendWelcomeEmail(
      updatedUserDoc.email,
      updatedUserDoc.name || "Usuario",
      updatedUserDoc.email,
      passwordToSend
    )
      .then((res) => console.log("📧 [UPDATE] Correo enviado:", res.success))
      .catch((err) =>
        console.warn("📧 [UPDATE] No se pudo enviar correo:", err?.message)
      );
  }

  return updatedUserDoc as unknown as User;
};
