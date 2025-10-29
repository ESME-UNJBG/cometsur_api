// services/users.service.ts
import UserModel from "../models/user";
import { User } from "../interfaces/user.interface";
import { encrypt } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle";
import { isTemporaryEmail } from "../utils/emailValidator"; // <-- import del util

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
 * - Envía correo solo si cambia email o password.
 * - Si el email es temporal/falso, NO se envía correo, pero la actualización sí se realiza.
 * - El envío de correo se ejecuta en background para no bloquear la API.
 */
export const UpdateUser = async (
  id: string,
  data: Partial<User>
): Promise<User | null> => {
  console.log(`🔄 [UPDATE] Inicio actualización usuario: ${id}`);
  const oldUserDoc = await UserModel.findById(id);
  if (!oldUserDoc) {
    console.warn(`❌ [UPDATE] Usuario no encontrado: ${id}`);
    throw new Error("Usuario no encontrado");
  }

  let plainPassword: string | undefined;
  let emailChanged = false;
  let passwordChanged = false;

  // Detectar cambio de email
  if (typeof data.email === "string" && data.email !== oldUserDoc.email) {
    emailChanged = true;
    console.log(
      `✏️ [UPDATE] Email cambiado: ${oldUserDoc.email} -> ${data.email}`
    );
  }

  // Si se envió una nueva contraseña, guardar la versión en texto y encriptarla
  if (typeof data.password === "string" && data.password.length > 0) {
    plainPassword = data.password;
    data.password = await encrypt(data.password);
    passwordChanged = true;
    console.log(
      "🔐 [UPDATE] Contraseña provista, será encriptada y enviada en notificación (si procede)."
    );
  }

  // Actualizamos el usuario y devolvemos el documento nuevo
  const updatedUserDoc = await UserModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  if (!updatedUserDoc) {
    console.warn(
      `⚠️ [UPDATE] No se pudo obtener el documento actualizado para: ${id}`
    );
    return null;
  }

  console.log(`✅ [UPDATE] Usuario actualizado en BD: ${updatedUserDoc._id}`);

  // Si hubo cambio de email o password, preparamos el envío de correo
  if (emailChanged || passwordChanged) {
    const nameToSend = updatedUserDoc.name || "Usuario";
    const emailToSend = updatedUserDoc.email;
    const passwordToSend =
      plainPassword ?? "Tu contraseña no ha sido modificada.";

    // NOTE: Validación simple para correos temporales
    if (isTemporaryEmail(emailToSend)) {
      // Si el email es desechable, NO enviamos correo pero sí devolvemos el usuario actualizado.
      console.log(
        `🚫 [UPDATE] Correo temporal detectado (${emailToSend}). Omitiendo envío de notificación.`
      );
    } else {
      // Enviar correo en background: no bloquea la respuesta al cliente
      sendWelcomeEmail(emailToSend, nameToSend, emailToSend, passwordToSend)
        .then((res) => {
          console.log("📧 [UPDATE] Resultado envío:", res);
        })
        .catch((err) => {
          // No rompemos la actualización por un fallo en el envío de correo
          console.warn(
            "📧 [UPDATE] Error enviando correo (no crítico):",
            err?.message || err
          );
        });
    }
  } else {
    console.log(
      "ℹ️ [UPDATE] No hubo cambio de email ni contraseña - no se enviará notificación."
    );
  }

  return updatedUserDoc as unknown as User;
};
