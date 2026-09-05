import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, ArrowRight, MailOpen, RefreshCw } from "lucide-react";

/**
 * VerifyEmailPage
 * Mounted when the URL path is /verify-email.
 * Reads ?token= from the URL, calls the backend, shows success/error state.
 */
export default function VerifyEmailPage({ onContinue }) {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("idle"); // "idle" | "sending" | "sent" | "cooldown"
  const [cooldownSecs, setCooldownSecs] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    fetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setEmail(data.email || "");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          const detail = data.detail;
          if (detail && typeof detail === "object") {
            setMessage(detail.message || "Verification link is invalid or has expired.");
            setEmail(detail.email || "");
          } else {
            setMessage(
              typeof detail === "string"
                ? detail
                : "Verification link is invalid or has expired."
            );
          }
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      });
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldownSecs <= 0) return;
    const t = setTimeout(() => setCooldownSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecs]);

  const handleResend = async () => {
    if (!email) return;
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
      } else {
        setResendStatus("sent");
      }
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {/* Header */}
        <div className="verify-header">
          <div className="verify-logo">✈️</div>
          <h1 className="verify-brand">Travel Planner</h1>
        </div>

        {/* Body */}
        <div className="verify-body">
          {status === "loading" && (
            <div className="verify-state loading">
              <Loader2 className="verify-icon spin" size={56} />
              <h2>Verifying your email…</h2>
              <p>Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="verify-state success">
              <CheckCircle className="verify-icon success-icon" size={56} />
              <h2>Email Verified!</h2>
              <p>{message}</p>
              {email && (
                <div className="verify-email-badge">
                  <MailOpen size={14} />
                  <span>{email}</span>
                </div>
              )}
              <button className="verify-cta-btn" onClick={onContinue}>
                Continue to Travel Planner
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="verify-state error">
              <XCircle className="verify-icon error-icon" size={56} />
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div className="verify-error-actions">
                {email && (
                  <>
                    {resendStatus === "sent" ? (
                      <div className="verify-resent-msg">
                        <CheckCircle size={14} />
                        New verification email sent! Check your inbox.
                      </div>
                    ) : resendStatus === "cooldown" ? (
                      <div className="verify-cooldown-msg">
                        <RefreshCw size={14} />
                        Resend available in {cooldownSecs}s
                      </div>
                    ) : (
                      <button
                        className="verify-resend-btn"
                        onClick={handleResend}
                        disabled={resendStatus === "sending"}
                      >
                        {resendStatus === "sending" ? (
                          <>
                            <Loader2 size={14} className="spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <RefreshCw size={14} />
                            Resend Verification Email
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
                <button className="verify-login-link" onClick={onContinue}>
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
