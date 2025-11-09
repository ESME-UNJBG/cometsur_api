import { Auth } from "../interfaces/auth.interface";
import { User } from "../interfaces/user.interface";
import UserModel from "../models/user";
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle";
import { isTemporaryEmail } from "../utils/emailValidator";

/**
 * 🔹 Registro de nuevo usuario
 * - Verifica que el email y baucher no existan
 * - Permite cualquier email (falso o real)
 * - Envía correo solo si no es temporal
 */
const registerNewUser = async ({
  email,
  password,
  name,
  university,
  category,
  importe,
  pago,
  baucher,
  profesion,
}: User) => {
  try {
    console.log("🔐 [REGISTRO] Iniciando registro para:", email);

    // 🔸 Verificar si el usuario ya existe por email
    const checkIs = await UserModel.findOne({ email });
    if (checkIs) {
      console.log("❌ [REGISTRO] Usuario ya existe:", email);
      return "Usuario ya existe :)";
    }

    // 🔸 Verificar si el baucher ya fue registrado
    const existingBaucher = await UserModel.findOne({ baucher });
    if (existingBaucher) {
      console.log("❌ [REGISTRO] Baucher ya registrado:", baucher);
      return "El baucher ya fue registrado.";
    }

    // 🔸 Encriptar la contraseña
    const passHash = await encrypt(password);

    // 🔸 Crear el nuevo usuario
    const newUser = await UserModel.create({
      email,
      password: passHash,
      name,
      university,
      importe,
      category,
      pago,
      baucher,
      profesion,
    });

    console.log("✅ [REGISTRO] Usuario creado en BD:", {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      university: newUser.university,
      importe: newUser.importe,
      category: newUser.category,
      pago: newUser.pago,
      baucher: newUser.baucher,
      profesion: newUser.profesion,
    });

    // 🔸 Validación antes de enviar correo
    if (!isTemporaryEmail(email)) {
      sendWelcomeEmail(email, name, email, password)
        .then((res) =>
          console.log("📧 [REGISTRO] Correo enviado:", res.success)
        )
        .catch((err) =>
          console.warn("📧 [REGISTRO] No se pudo enviar correo:", err?.message)
        );
    } else {
      console.log(
        "🚫 [REGISTRO] Correo temporal detectado, no se envía:",
        email
      );
    }

    return newUser;
  } catch (error: any) {
    console.error("💥 [REGISTRO] Error al registrar usuario:", error.message);

    // Manejo específico para duplicados de baucher o email
    if (error.code === 11000) {
      if (error.keyPattern?.email) return "El email ya fue registrado.";
      if (error.keyPattern?.baucher) return "El baucher ya fue registrado.";
    }

    return "Error al registrar usuario.";
  }
};

/**
 * 🔹 Login de usuario
 */
const loginUser = async ({ email, password }: Auth) => {
  console.log("🔐 [LOGIN] Intentando login para:", email);

  const checkIs = await UserModel.findOne({ email });
  if (!checkIs) {
    console.log("❌ [LOGIN] Usuario no encontrado:", email);
    return "No coinciden";
  }

  const IsCorrect = await verified(password, checkIs.password);
  if (!IsCorrect) {
    console.log("❌ [LOGIN] Contraseña incorrecta para:", email);
    return "Contraseña incorrecta";
  }

  // Generar token JWT
  const token = generateToken({
    _id: checkIs._id.toString(),
    estado: checkIs.estado,
  });

  const data = {
    token,
    user: {
      _id: checkIs._id.toString(),
      email: checkIs.email,
      name: checkIs.name,
      estado: checkIs.estado,
      asistencia: checkIs.asistencia || 0,
      university: checkIs.university,
      importe: checkIs.importe,
      category: checkIs.category,
      pago: checkIs.pago,
      baucher: checkIs.baucher,
      profesion: checkIs.profesion,
    },
  };

  console.log("🎉 [LOGIN] Login exitoso para:", email);
  return data;
};

export { registerNewUser, loginUser };
