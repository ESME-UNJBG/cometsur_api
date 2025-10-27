import nodemailer from "nodemailer";

interface SendEmailResult {
  success: boolean;
  error?: any;
}

/**
 * Envía un correo de bienvenida o actualización de credenciales.
 * - Mantiene diseño original con colores y estilo.
 * - No bloquea la API si falla.
 * - Logs completos para depuración en Render.
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  email: string,
  password: string
): Promise<SendEmailResult> => {
  try {
    const senderEmail = process.env.EMAIL_USER || "";
    const senderPass = process.env.EMAIL_PASS || "";
    const allowInsecure = process.env.SMTP_ALLOW_INSECURE === "true"; // solo true en DEV
    const domain = senderEmail.split("@")[1]?.toLowerCase() || "";

    if (!senderEmail || !senderPass) {
      throw new Error(
        "EMAIL_USER o EMAIL_PASS no están configurados en las variables de entorno."
      );
    }

    // Configuración automática según proveedor
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
        user: senderEmail,
        pass: senderPass,
      },
      tls: {
        rejectUnauthorized: !allowInsecure,
      },
    });

    const mailOptions = {
      from: `"Cometsur" <${senderEmail}>`,
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

    console.log(
      `🚀 [EMAIL] Intentando enviar correo a ${to} mediante ${host}...`
    );

    // Envío y depuración extendida
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("✅ [EMAIL] Correo enviado correctamente");
        console.log("📨 [SMTP RESPONSE]", {
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
          envelope: info.envelope,
          messageId: info.messageId,
        });
      })
      .catch((err) => {
        console.warn(`❌ [EMAIL] No se pudo enviar correo a ${to}`);
        console.error("🧩 [SMTP ERROR DETAILS]:", {
          message: err?.message,
          code: err?.code,
          command: err?.command,
          stack: err?.stack,
        });
      });

    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Error preparando correo:", error);
    return { success: false, error };
  }
};
