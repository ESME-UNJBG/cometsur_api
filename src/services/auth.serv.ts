import { Auth } from "../interfaces/auth.interface";
import { User } from "../interfaces/user.interface";
import UserModel from "../models/user";
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/password.handle";
import { sendWelcomeEmail } from "../utils/email.handle";

const registerNewUser = async ({ email, password, name }: User) => {
  console.log("🔐 [REGISTRO] Iniciando registro para:", email);

  const checkIs = await UserModel.findOne({ email });
  if (checkIs) {
    console.log("❌ [REGISTRO] Usuario ya existe:", email);
    return "Usuario ya existe :)";
  }

  console.log("🔐 [REGISTRO] Encriptando contraseña...");
  const passHash = await encrypt(password);
  console.log("✅ [REGISTRO] Contraseña encriptada correctamente");

  const registerNewUser = await UserModel.create({
    email,
    password: passHash,
    name,
  });

  console.log("✅ [REGISTRO] Usuario creado en BD:", {
    id: registerNewUser._id,
    email: registerNewUser.email,
    name: registerNewUser.name,
  });

  if (email && email.includes("@")) {
    console.log("📧 [REGISTRO] Enviando correo de bienvenida...");
    await sendWelcomeEmail(email, name, email, password);
  }

  return registerNewUser;
};

const loginUser = async ({ email, password }: Auth) => {
  console.log("🔐 [LOGIN] Intentando login para:", email);

  const checkIs = await UserModel.findOne({ email });
  if (!checkIs) {
    console.log("❌ [LOGIN] Usuario no encontrado:", email);
    return "No coinciden";
  }

  console.log("✅ [LOGIN] Usuario encontrado:", {
    id: checkIs._id,
    email: checkIs.email,
    estado: checkIs.estado,
  });

  const passwordHash = checkIs.password;
  console.log("🔐 [LOGIN] Verificando contraseña...");
  const IsCorrect = await verified(password, passwordHash);

  if (!IsCorrect) {
    console.log("❌ [LOGIN] Contraseña incorrecta para:", email);
    return "Contraseña incorrecta";
  }

  console.log("✅ [LOGIN] Contraseña verificada correctamente");

  // ❌❌❌ PROBLEMA CRÍTICO AQUÍ ❌❌❌
  // ESTO ESTÁ MAL: Usar email como ID y "role" en lugar de "estado"
  // const token = generateToken({ id: checkIs.email, role: checkIs.estado });

  // ✅✅✅ SOLUCIÓN CORRECTA ✅✅✅
  console.log("🎫 [LOGIN] Generando token JWT...");
  const token = generateToken({
    _id: checkIs._id.toString(), // ✅ ID REAL de MongoDB
    estado: checkIs.estado, // ✅ Campo REAL de tu modelo
  });

  console.log("✅ [LOGIN] Token generado con:", {
    _id: checkIs._id.toString(),
    estado: checkIs.estado,
  });

  // ❌ PROBLEMA: Estás devolviendo el usuario COMPLETO (incluye password)
  // const data = { token, user: checkIs };

  // ✅ SOLUCIÓN: Devolver solo los campos seguros
  const data = {
    token,
    user: {
      _id: checkIs._id.toString(), // ✅ ID para el frontend
      email: checkIs.email, // ✅ Email para mostrar
      name: checkIs.name, // ✅ Nombre para la UI
      estado: checkIs.estado, // ✅ Estado para permisos
      asistencia: checkIs.asistencia || 0, // ✅ Asistencia si la necesitas
      // ❌ NO incluir: password, createdAt, updatedAt
    },
  };

  console.log("🎉 [LOGIN] Login exitoso para:", checkIs.email);
  console.log("📤 [LOGIN] Enviando respuesta al frontend SIN password");

  return data;
};

export { registerNewUser, loginUser };
