"""
Email Service — Travel Planner
-------------------------------
Uses Python's built-in smtplib to send emails (no extra dependencies).

Local development:
  Leave EMAIL_HOST blank in .env - the verification URL is printed to the
  backend console prefixed with [DEV EMAIL]. Copy-paste into your browser.

Production:
  Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
  in your .env / environment. Any SMTP provider works (Gmail, SendGrid
  SMTP relay, Mailgun SMTP, AWS SES SMTP, etc.).
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.config import settings

logger = logging.getLogger("travel_planner.email")


class EmailService:

    @staticmethod
    def _build_verification_html(name: str, verify_url: str) -> str:
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Travel Planner account</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#1a1d2e,#16213e);border-radius:16px;
                      border:1px solid rgba(139,92,246,0.25);overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:36px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">✈️</div>
              <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;letter-spacing:-0.5px;">
                Travel Planner
              </h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">
                AI-Powered Trip Planning
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 12px;font-weight:600;">
                Hello {name} 👋
              </h2>
              <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Thanks for creating your Travel Planner account!<br/>
                Please verify your email address by clicking the button below.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;padding:1px;">
                    <a href="{verify_url}"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                              color:#fff;text-decoration:none;padding:14px 36px;
                              border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;word-break:break-all;">
                If the button does not work, copy and paste this link into your browser:<br/>
                <a href="{verify_url}" style="color:#818cf8;">{verify_url}</a>
              </p>
              <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);
                          border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                <p style="color:#a78bfa;font-size:13px;margin:0;">
                  This verification link expires in <strong>30 minutes</strong>.
                </p>
              </div>
              <p style="color:#475569;font-size:13px;margin:0;">
                If you did not create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f1117;padding:24px 40px;text-align:center;
                       border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#334155;font-size:12px;margin:0;">
                &copy; 2026 Travel Planner &middot; AI-Powered Trip Planning
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    @staticmethod
    def _build_verification_text(name: str, verify_url: str) -> str:
        return (
            f"Hello {name},\n\n"
            "Thanks for creating your Travel Planner account!\n\n"
            "Please verify your email address by visiting:\n\n"
            f"{verify_url}\n\n"
            "This verification link expires in 30 minutes.\n\n"
            "If you did not create this account, you can safely ignore this email.\n\n"
            "-- Travel Planner Team"
        )

    @staticmethod
    def _send_smtp(to_email: str, subject: str, html_body: str, text_body: str) -> None:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        if settings.EMAIL_USE_TLS:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.ehlo()
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.ehlo()

        if settings.EMAIL_USER and settings.EMAIL_PASSWORD:
            server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)

        server.sendmail(settings.EMAIL_FROM, [to_email], msg.as_string())
        server.quit()

    @staticmethod
    def send_verification_email(name: str, email: str, raw_token: str) -> bool:
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
        subject = "Verify your Travel Planner account"
        html_body = EmailService._build_verification_html(name, verify_url)
        text_body = EmailService._build_verification_text(name, verify_url)

        if not settings.EMAIL_HOST:
            print("\n" + "=" * 72)
            print("[DEV EMAIL] No SMTP configured -- printing verification link:")
            print(f"  To     : {email}")
            print(f"  Subject: {subject}")
            print(f"  Link   : {verify_url}")
            print("=" * 72 + "\n")
            logger.info(f"[DEV] Verification email skipped (no SMTP). Sent to console for {email}.")
            return True

        try:
            EmailService._send_smtp(email, subject, html_body, text_body)
            logger.info(f"Verification email sent to {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {e}")
            return False
