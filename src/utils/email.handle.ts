import nodemailer from "nodemailer";

/**
 * Envía un correo de bienvenida con diseño optimizado para modo claro/oscuro.
 * Retorna { success: boolean, error?: any } para que el llamador no "rompa" la lógica principal.
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const senderEmail = process.env.EMAIL_USER || "";
    const allowInsecure = process.env.SMTP_ALLOW_INSECURE === "true"; // sólo true en DEV
    const domain = senderEmail.split("@")[1]?.toLowerCase() || "";

    if (!senderEmail || !process.env.EMAIL_PASS) {
      throw new Error(
        "EMAIL_USER o EMAIL_PASS no están configurados en las variables de entorno."
      );
    }

    let host = "smtp.gmail.com";
    let port = 465;
    let secure = true;

    if (domain.includes("outlook") || domain.includes("hotmail")) {
      host = "smtp.office365.com";
      port = 587;
      secure = false;
    } else if (domain.includes("yahoo")) {
      host = "smtp.mail.yahoo.com";
      port = 465;
      secure = true;
    } else if (domain.includes(".edu.") || domain.endsWith(".edu.pe")) {
      host = `smtp.${domain}`;
      port = 465;
      secure = true;
    } else if (!domain.includes("gmail")) {
      host = `mail.${domain}`;
      port = 465;
      secure = true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // En producción allowInsecure = false -> rejectUnauthorized = true (seguro)
        // En DEV puedes poner SMTP_ALLOW_INSECURE=true para permitir false
        rejectUnauthorized: !allowInsecure,
      },
    });

    const mailOptions = {
      from: `"Cometsur" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Credenciales de acceso - Cometsur 🎉",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f4f4f4;
          color: #222222;
          border-radius: 10px;
        ">
          <h2 style="color: #444444; margin: 0 0 8px 0;">Hola, ${name} 👋</h2>
          <p style="margin: 6px 0 0 0;">
            El congreso <strong style="color:#b33;">Cometsur</strong> te da la bienvenida al evento.
          </p>
          <p style="margin: 8px 0 0 0;">
            Gracias por registrarte. Esperamos que disfrutes la experiencia.
          </p>

          <br/>

          <div style="
            background-color: #e2b3b3;
            padding: 15px;
            border-radius: 10px;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
          ">
            <h3 style="margin: 0 0 8px 0;">🔐 Tus credenciales para iniciar sesión:</h3>
            <p style="margin: 4px 0;"><strong>Correo:</strong> ${email}</p>
            <p style="margin: 4px 0;"><strong>Contraseña:</strong> ${password}</p>
          </div>

          <br/>
          <p style="font-size: 14px; color: #555555; margin: 0;">
            — Equipo Cometsur
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado correctamente a ${to} mediante ${host}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    // No lanzamos excepción: devolvemos estado y permitimos que el llamador continúe
    return { success: false, error };
  }
};
