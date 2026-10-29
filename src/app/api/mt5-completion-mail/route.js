import { NextResponse } from "next/server";
import { mailgunClient, MAILGUN_DOMAIN, MAILGUN_FROM } from "@/config/nodemailer";
import { TraderCompletionMail } from "./template";

export async function POST(req) {
  const data = await req.json();

  try {
    const res = await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: MAILGUN_FROM,
      to: data?.email,
      subject: "GTCFX Demo Account - Activation Details",
      html: TraderCompletionMail(data),
    });

    return NextResponse.json(
      { message: "Send Successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error Sending Mail" },
      { status: 500 }
    );
  }
}
