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
 */
export const UpdateUser = async (
  id: string,
  data: Partial<User>
): Promise<User | null> => {
  // Obtener usuario actual (antes de actualizar)
  const oldUserDoc = await UserModel.findById(id);
  if (!oldUserDoc) throw new Error("Usuario no encontrado");

  let plainPassword: string | undefined;
  let emailChanged = false;
  let passwordChanged = false;

  // Detectar cambio de email
  if (typeof data.email === "string" && data.email !== oldUserDoc.email) {
    emailChanged = true;
  }

  // Si se envió una nueva contraseña, guardamos la versión en texto para el correo
  if (typeof data.password === "string" && data.password.length > 0) {
    plainPassword = data.password;
    data.password = await encrypt(data.password);
    passwordChanged = true;
  }

  // Actualizamos el usuario y devolvemos el documento nuevo
  const updatedUserDoc = await UserModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  // Si no hubo documento actualizado (p. ej. borrado mientras tanto)
  if (!updatedUserDoc) return null;

  // Solo enviar correo si cambió email o contraseña
  if (emailChanged || passwordChanged) {
    const nameToUse = updatedUserDoc.name || "Usuario";
    const emailToUse = updatedUserDoc.email;

    // Si no hay contraseña nueva, indicamos que no fue modificada
    const passwordToSend =
      plainPassword ?? "Tu contraseña no ha sido modificada.";

    if (emailToUse && emailToUse.includes("@")) {
      try {
        await sendWelcomeEmail(
          emailToUse,
          nameToUse,
          emailToUse,
          passwordToSend
        );
      } catch (err) {
        // No rompemos la actualización por un fallo en el envío de correo
        console.error("Error enviando email tras actualización:", err);
      }
    }
  }

  return updatedUserDoc as unknown as User;
};
