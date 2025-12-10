import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false, // 🔑 necesario para STARTTLS
    auth: {
      user: "apikey", // literal, siempre es "apikey"
      pass: process.env.SENDGRID_API_KEY, // tu API Key desde .env.local
    },
  });

  try {
    await transporter.sendMail({
      from: "tresenruta@outlook.com", // remitente verificado en SendGrid
      to: email,
      subject: "Código de verificación",
      text: `Tu código es: ${code}`,
      html: `<p>Tu código de verificación es: <b>${code}</b></p>`, // versión HTML opcional
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error enviando correo:", error.message, error);
    return NextResponse.json({ success: false, message: "Error al enviar correo" });
  }
}
