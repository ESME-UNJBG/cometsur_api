import { Auth } from "../interfaces/auth.interface";
import { User } from "../interfaces/user.interface";
import UserModel from "../models/user";
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle";
import { isTemporaryEmail } from "../utils/emailValidator"; // 👈 Nuevo import

/**
 * 🔹 Registro de nuevo usuario
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
}: User) => {
  console.log("🔐 [REGISTRO] Iniciando registro para:", email);

  const checkIs = await UserModel.findOne({ email });
  if (checkIs) {
    console.log("❌ [REGISTRO] Usuario ya existe:", email);
    return "Usuario ya existe :)";
  }

  const passHash = await encrypt(password);

  const newUser = await UserModel.create({
    email,
    password: passHash,
    name,
    university,
    importe,
    category,
  });

  console.log("✅ [REGISTRO] Usuario creado en BD:", {
    id: newUser._id,
    email: newUser.email,
    name: newUser.name,
    university: newUser.university,
    importe: newUser.importe,
    category: newUser.category,
  });

  // 👇 Validación antes de enviar correo
  if (!isTemporaryEmail(email)) {
    sendWelcomeEmail(email, name, email, password)
      .then((res) => console.log("📧 [REGISTRO] Correo enviado:", res.success))
      .catch((err) =>
        console.warn("📧 [REGISTRO] No se pudo enviar correo:", err?.message)
      );
  } else {
    console.log("🚫 [REGISTRO] Correo temporal detectado, no se envía:", email);
  }

  return newUser;
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
    },
  };

  console.log("🎉 [LOGIN] Login exitoso para:", email);
  return data;
};

export { registerNewUser, loginUser };
