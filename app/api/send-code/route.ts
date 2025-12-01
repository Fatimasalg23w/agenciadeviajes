import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey", // literal, siempre es "apikey"
      pass: process.env.SENDGRID_API_KEY, // tu API Key desde .env.local
    },
  });

  try {
    await transporter.sendMail({
      from: "tresenruta@outlook.com", // tu remitente verificado en SendGrid
      to: email,
      subject: "Código de verificación",
      text: `Tu código es: ${code}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return NextResponse.json({ success: false, message: "Error al enviar correo" });
  }
}
