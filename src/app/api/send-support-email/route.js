import { NextResponse } from "next/server";
import {
  mailgunClient,
  MAILGUN_DOMAIN,
  MAILGUN_FROM,
} from "@/config/nodemailer";

const row = (label, value) =>
  value != null && String(value).trim() !== ""
    ? `<tr><th style="padding: 10px; text-align: left; background-color: #f2f2f2; color: #192055;">${label}</th><td style="padding: 10px; border: 1px solid #ddd;">${String(value)}</td></tr>`
    : "";

const generateEmailContent = (data) => {
  const contactRows = [
    row("Registration Status", data?.registration_status),
    row("Full Name", [data?.first_name, data?.last_name].filter(Boolean).join(" ") || "—"),
    row("Email Address", data?.email),
    row("Phone Number", data?.phone),
    row("Country", data?.country),
  ].join("");

  const ticketRows = [
    row("Ticket Type", data?.ticket_type),
    row("Complaint Type", data?.complaint_type),
    row("Trading Complaint Type", data?.trading_complaint_type),
    row("Promotion/Bonus Type", data?.promotion_bonus_type),
    row("Trade Account", data?.trade_account),
    row("Transaction ID(s)", data?.transaction_ids),
    row("Trade Order(s) ID", data?.trade_order_ids),
    row("Date and Time of Incident", data?.date_time_incident),
    row("Deposit Amount", data?.deposit_amount),
    row("Subject", data?.subject),
    row("Attachment", data?.attachment_name ? data.attachment_name + (data.attachment_base64 ? " (attached)" : "") : ""),
  ].join("");

  return {
  subject: `Contact Form: ${data?.ticket_type || "Support"} – ${(data?.subject || "").substring(0, 40)}`,
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Us Query Submitted</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F7; font-family: 'Outfit', Arial, sans-serif; color: #1e2158; text-align: left; line-height: 22px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="border-spacing: 0; width: 100%;">
        <tr>
            <td align="center" bgcolor="#F7F7F7">
                <div class="container" style="max-width: 650px; margin: 0 auto; background-color: #192055; padding: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-radius: 36px; padding: 20px; background-color: #fff; width: 100%;">
                        <tr>
                            <td class="header" style="padding: 20px; text-align: center;">
                                <img src="https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/email-test.png" alt="GTC Global Capital Trade Logo" style="max-width: 165px; height: auto;">
                            </td>
                        </tr>
                        <tr>
                            <td class="content" style="width: 100%;">
                                <h1 style="color: #192055; text-align:center; font-size: 18px; margin: 0px auto;">
                                    New Contact Us Query Submitted
                                </h1>
                                <h3 style="font-size: 16px; color: #192055;">
                                    Dear Admin/Support Team,
                                </h3>
                                <p>A new query has been submitted through the Contact Us form. Please find the details below:</p>
                                
                                <h2 style="color: #192055; font-size: 16px;">Contact Information</h2>
                                <table class="content-table" style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                                    ${contactRows}
                                </table>

                                ${ticketRows ? `<h2 style="color: #192055; font-size: 16px; margin-top: 20px;">Ticket Details</h2>
                                <table class="content-table" style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                                    ${ticketRows}
                                </table>` : ""}

                                <h3 style="color: #192055; font-size: 14px; margin-top: 16px;">Ticket Description</h3>
                                <p style="padding: 10px; border: 1px solid #ddd; background: #fafafa; white-space: pre-wrap;">${(data?.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>

                                <p style="line-height: 30px; padding-top: 20px;">Please respond to this query promptly. Thank you.</p>
                                <p style="line-height: 30px; padding-top: 20px;">Best Regards,<br><strong style="color: #192055; margin-top: 5px;">GTCFX Team</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer" style="padding: 20px 0px; font-size: 10px; color: #000; background-color: #f7f7f736; border-radius: 0 0 36px 36px; text-align: center;">
                                <div class="social-icons" style="padding-bottom: 10px;">
                                    <a href="https://www.facebook.com/GTCFXGlobalTradeCapital" style="text-decoration: none;" target="_blank">
                                        <img alt="Facebook" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/facebook_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://x.com/GTC_fx" style="text-decoration: none;" target="_blank">
                                        <img alt="Twitter" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/twitter_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.linkedin.com/company/gtcfx-official" style="text-decoration: none;" target="_blank">
                                        <img alt="LinkedIn" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/linkedin_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.youtube.com/channel/UCnKWakjm1b9Bm63xgwNFXHA" style="text-decoration: none;" target="_blank">
                                        <img alt="YouTube" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/youtube_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.instagram.com/gtcfxofficial/" style="text-decoration: none;" target="_blank">
                                        <img alt="Instagram" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/instagram_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                    <a href="https://www.tiktok.com/@gtcgroup_official" style="text-decoration: none;" target="_blank">
                                        <img alt="TikTok" src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/default/tiktok_96.png" style="width: 24px; height: 24px; margin: 0 5px;">
                                    </a>
                                </div>
                               
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                    Disclaimers: The information in this email is for general purposes only and does not constitute personal financial advice. Please assess the relevance of this information to your own financial goals and situation. Investing in contract for difference products carries significant risks and may not be suitable for all investors. Losses may exceed the initial deposit. You do not have ownership rights to the underlying assets of the contract. We advise seeking professional guidance to fully understand the risks before trading. Please review our user terms, risk warnings, privacy policy, and other relevant documents before making financial decisions.
                                </p>
                                <p style="font-size: 9px; line-height: 13px; text-align: left;">
                                    Note that our products and services are not available in restricted countries.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>

  `,
  };
};

export async function POST(req) {
  try {
    const reqBody = await req.json();
    const content = generateEmailContent(reqBody);

    const mailgunPayload = {
      from: MAILGUN_FROM,
      to: "zeeshan@gtcfx.com",
      ...content,
    };

    if (reqBody.attachment_base64 && reqBody.attachment_name) {
      const attachmentBuffer = Buffer.from(reqBody.attachment_base64, "base64");
      mailgunPayload.attachment = [
        {
          filename: reqBody.attachment_name,
          data: attachmentBuffer,
        },
      ];
    }

    const res = await mailgunClient.messages.create(MAILGUN_DOMAIN, mailgunPayload);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
