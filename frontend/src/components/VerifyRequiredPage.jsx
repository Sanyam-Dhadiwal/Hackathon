import React, { useState, useEffect } from "react";
import { MailOpen, RefreshCw, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

/**
 * VerifyRequiredPage
 * Shown after registration or when a login attempt is blocked due to unverified email.
 * Lets the user resend the verification email or go back to login.
 */
export default function VerifyRequiredPage({ email, onBack }) {
  const [resendStatus, setResendStatus] = useState("idle"); // "idle" | "sending" | "sent" | "cooldown"
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [error, setError] = useState("");

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldownSecs <= 0) {
      if (resendStatus === "cooldown") setResendStatus("idle");
      return;
    }
    const t = setTimeout(() => setCooldownSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecs, resendStatus]);

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setResendStatus("sending");
    try {
      const res = await fetch("/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        const retryAfter = data.detail?.retry_after || 60;
        setCooldownSecs(retryAfter);
        setResendStatus("cooldown");
      } else if (res.ok) {
        setResendStatus("sent");
        // Auto-reset to idle after a few seconds so user can resend again after cooldown
        setTimeout(() => {
          setCooldownSecs(60);
          setResendStatus("cooldown");
        }, 2000);
      } else {
        setError(data.detail?.message || data.detail || "Failed to send email. Please try again.");
        setResendStatus("idle");
      }
    } catch {
      setError("A network error occurred. Please check your connection.");
      setResendStatus("idle");
    }
  };

  // Mask email for display: e.g. j***@gmail.com
  const maskedEmail = email
    ? (() => {
        const [local, domain] = email.split("@");
        if (!domain) return email;
        const masked = local.length <= 2 ? local[0] + "***" : local[0] + "***" + local[local.length - 1];
        return `${masked}@${domain}`;
      })()
    : "your email";

  return (
    <div className="verify-required-page">
      <div className="verify-required-card">
        {/* Icon */}
        <div className="vr-icon-wrap">
          <MailOpen size={40} className="vr-mail-icon" />
        </div>

        <h2 className="vr-title">Check your email</h2>
        <p className="vr-subtitle">
          We sent a verification link to
        </p>
        <div className="vr-email-badge">
          {maskedEmail}
        </div>
        <p className="vr-hint">
          Click the link in your email to verify your account and get started.
          The link expires in <strong>30 minutes</strong>.
        </p>

        {/* Resend section */}
        <div className="vr-resend-section">
          {resendStatus === "sent" ? (
            <div className="vr-sent-msg">
              <CheckCircle size={16} />
              New verification email sent!
            </div>
          ) : resendStatus === "cooldown" ? (
            <div className="vr-cooldown-msg">
              <RefreshCw size={14} />
              Resend available in {cooldownSecs}s
            </div>
          ) : (
            <>
              <p className="vr-resend-label">Didn&apos;t receive it?</p>
              <button
                className="vr-resend-btn"
                onClick={handleResend}
                disabled={resendStatus === "sending"}
              >
                {resendStatus === "sending" ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    Resend Verification Email
                  </>
                )}
              </button>
            </>
          )}

          {error && <p className="vr-error">{error}</p>}
        </div>

        {/* Back link */}
        <button className="vr-back-btn" onClick={onBack}>
          <ArrowLeft size={14} />
          Use a different email / Back to Login
        </button>
      </div>
    </div>
  );
}
