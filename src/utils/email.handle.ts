import nodemailer from "nodemailer";

interface SendEmailResult {
  success: boolean;
  error?: any;
}

/**

* Envío de correo mediante Brevo SMTP.
* * 100% compatible con Render (sin timeout).
* * Usa variables de entorno configuradas en Settings > Environment.
* * Incluye logs detallados para depuración.
    */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  email: string,
  password: string
): Promise<SendEmailResult> => {
  try {
    const smtpUser = process.env.BREVO_SMTP_USER || "";
    const smtpKey = process.env.BREVO_SMTP_KEY || "";
    const smtpHost = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
    const smtpPort = Number(process.env.BREVO_SMTP_PORT) || 587;

    if (!smtpUser || !smtpKey) {
      throw new Error(
        "❌ Variables SMTP de Brevo no configuradas correctamente."
      );
    }

    // Configuración del transporte SMTP de Brevo
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true, // Brevo usa TLS STARTTLS, no SSL
      auth: {
        user: smtpUser,
        pass: smtpKey,
      },
    });

    const mailOptions = {
      from: `"Cometsur" <${smtpUser}>`,
      to,
      subject: "Credenciales de acceso - Cometsur 🎉",
      html: `      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">        <h2 style="color: #444;">Hola, ${name} 👋</h2>        <p>El congreso <strong style="color:#b33;">Cometsur</strong> te da la bienvenida al evento.</p>        <p>Gracias por registrarte. Esperamos que disfrutes la experiencia.</p>        <br/>        <div style="background-color: #e2b3b3; padding: 15px; border-radius: 10px; color: #fff;">          <h3>🔐 Tus credenciales para iniciar sesión:</h3>          <p><strong>Correo:</strong> ${email}</p>          <p><strong>Contraseña:</strong> ${password}</p>        </div>        <br/>        <p style="font-size: 14px; color: #555;">— Equipo Cometsur</p>      </div>
     `,
    };

    console.log(`🚀 [EMAIL] Enviando correo a ${to} vía Brevo SMTP...`);

    await transporter.sendMail(mailOptions);

    console.log("✅ [EMAIL] Correo enviado correctamente vía Brevo.");
    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Error al enviar correo:", error);
    return { success: false, error };
  }
};
