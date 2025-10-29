import axios from "axios";

interface SendEmailResult {
  success: boolean;
  error?: any;
}

/**
 * Envío de correo mediante la API HTTP de Brevo (no SMTP).
 * 100% compatible con Render (sin timeouts).
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  email: string,
  password: string
): Promise<SendEmailResult> => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("❌ BREVO_API_KEY no configurada en .env");
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Cometsur",
          email: "edgardsantiagochipanaescalante@gmail.com",
        }, // debe estar verificado en Brevo
        to: [{ email: to, name }],
        subject: "Credenciales de acceso - Cometsur 🎉",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
            <h2 style="color: #444;">Hola, ${name} 👋</h2>
            <p>El congreso <strong style="color:#b33;">Cometsur</strong> te da la bienvenida al evento.</p>
            <p>Gracias por registrarte. Esperamos que disfrutes la experiencia.</p>
            <br/>
            <div style="background-color: #e2b3b3; padding: 15px; border-radius: 10px; color: #fff;">
              <h3>🔐 Tus credenciales para iniciar sesión:</h3>
              <p><strong>Correo:</strong> ${email}</p>
              <p><strong>Contraseña:</strong> ${password}</p>
            </div>
            <br/>
            <p style="font-size: 14px; color: #555;">— Equipo Cometsur</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ [EMAIL] Correo enviado correctamente vía API Brevo.");
    return { success: true };
  } catch (error: any) {
    console.error("❌ [EMAIL] Error al enviar correo vía API:", error.message);
    return { success: false, error };
  }
};
