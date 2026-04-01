import { useEffect, useMemo, useRef, useState } from "react";
import { resetPasswordRequest, sendOtpRequest } from "../auth/authApi";
import "./VerifyOtp.css";

type Step = "email" | "reset" | "success";

interface ForgotPasswordProps {
  initialEmail?: string;
  onNavigate: (page: string) => void;
}

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    try {
      const parsed = JSON.parse(error.message) as { Message?: string };
      if (parsed?.Message) return parsed.Message;
    } catch {
      return error.message;
    }
  }
  return fallback;
}

export default function ForgotPassword({ initialEmail = "", onNavigate }: ForgotPasswordProps) {
  const autoSendDoneRef = useRef(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const canResend = step === "reset" && countdown <= 0 && !resending && !resetting;
  const validOtp = useMemo(() => /^\d{6}$/.test(otp.trim()), [otp]);

  useEffect(() => {
    if (step !== "reset" || countdown <= 0) return;

    const id = window.setInterval(() => {
      setCountdown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [step, countdown]);

  useEffect(() => {
    if (step !== "success") return;
    const id = window.setTimeout(() => {
      onNavigate("login");
    }, 1800);
    return () => window.clearTimeout(id);
  }, [step, onNavigate]);

  const startResetStep = (sentToEmail: string) => {
    setStep("reset");
    setCountdown(30);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpError(false);
    setPasswordError(false);
    setStatusError(false);
    setStatusMsg(`OTP sent to ${sentToEmail}`);
  };

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setStatusError(true);
      setStatusMsg("Email is required.");
      return;
    }

    setSending(true);
    setStatusError(false);
    setStatusMsg("");
    try {
      await sendOtpRequest({ email: normalizedEmail });
      startResetStep(normalizedEmail);
    } catch (error) {
      setStatusError(true);
      setStatusMsg(messageFromError(error, "Failed to send OTP."));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (autoSendDoneRef.current) return;
    if (!initialEmail.trim()) return;
    if (step !== "email") return;
    autoSendDoneRef.current = true;
    void handleSendOtp();
  }, [initialEmail, step]);

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResending(true);
    setStatusError(false);
    setStatusMsg("");
    try {
      await sendOtpRequest({ email: email.trim() });
      setCountdown(30);
      setOtp("");
      setStatusMsg(`New OTP sent to ${email.trim()}`);
    } catch (error) {
      setStatusError(true);
      setStatusMsg(messageFromError(error, "Failed to resend OTP."));
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!normalizedEmail) {
      setStatusError(true);
      setStatusMsg("Email is required.");
      return;
    }

    if (!validOtp) {
      setOtpError(true);
      setStatusError(true);
      setStatusMsg("Enter a valid 6-digit OTP.");
      window.setTimeout(() => setOtpError(false), 500);
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(true);
      setStatusError(true);
      setStatusMsg("New password is required.");
      window.setTimeout(() => setPasswordError(false), 500);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setStatusError(true);
      setStatusMsg("Passwords do not match.");
      window.setTimeout(() => setPasswordError(false), 500);
      return;
    }

    setResetting(true);
    setStatusError(false);
    setStatusMsg("");
    try {
      await resetPasswordRequest({
        email: normalizedEmail,
        otp: trimmedOtp,
        password: newPassword,
      });
      setStep("success");
    } catch (error) {
      setOtpError(true);
      setPasswordError(true);
      setStatusError(true);
      setStatusMsg(messageFromError(error, "Password reset failed."));
      window.setTimeout(() => {
        setOtpError(false);
        setPasswordError(false);
      }, 500);
    } finally {
      setResetting(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setCountdown(30);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpError(false);
    setPasswordError(false);
    setStatusError(false);
    setStatusMsg("");
  };

  const handleEnterKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (step === "email" && !sending) {
      void handleSendOtp();
      return;
    }
    if (step === "reset" && !resetting) {
      void handleResetPassword();
    }
  };

  return (
    <div id="otp-verification-page" onKeyDown={handleEnterKey}>
      <div className="otp-card">
        <div className="otp-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11h16v9H4z" />
            <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          </svg>
        </div>

        <div className="otp-steps">
          <div className={`otp-step ${step === "email" ? "active" : step === "reset" || step === "success" ? "done" : ""}`} />
          <div className={`otp-step ${step === "reset" ? "active" : step === "success" ? "done" : ""}`} />
        </div>

        <h1 className="otp-title">Forgot Your<br />Password?</h1>
        <p className="otp-subtitle">
          {step === "success"
            ? "Your password has been updated."
            : step === "reset"
            ? "Enter the OTP we emailed you and choose a new password."
            : "Enter your account email to receive a one-time password."}
        </p>

        {step === "email" && (
          <div>
            <div className="otp-field">
              <label className="otp-label" htmlFor="forgot-password-email">Email Address</label>
              <input
                id="forgot-password-email"
                type="email"
                className="otp-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={sending}
              />
            </div>

            {statusMsg && (
              <div className={`otp-status ${statusError ? "error" : ""}`}>{statusMsg}</div>
            )}

            <button className="otp-btn" onClick={() => void handleSendOtp()} disabled={sending}>
              {sending ? "Sending..." : "Send reset OTP"}
            </button>
          </div>
        )}

        {step === "reset" && (
          <div>
            <div className="otp-field">
              <label className="otp-label" htmlFor="forgot-password-otp">Verification Code</label>
              <input
                id="forgot-password-otp"
                type="tel"
                className={`otp-input ${otpError ? "error" : ""}`}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="one-time-code"
                disabled={resetting}
              />
            </div>

            <div className="otp-field">
              <label className="otp-label" htmlFor="forgot-password-new-password">New Password</label>
              <input
                id="forgot-password-new-password"
                type="password"
                className={`otp-input ${passwordError ? "error" : ""}`}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={resetting}
              />
            </div>

            <div className="otp-field">
              <label className="otp-label" htmlFor="forgot-password-confirm-password">Confirm Password</label>
              <input
                id="forgot-password-confirm-password"
                type="password"
                className={`otp-input ${passwordError ? "error" : ""}`}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                disabled={resetting}
              />
            </div>

            <div className="otp-timer-wrap">
              <span className={`otp-status ${statusError ? "error" : ""}`}>{statusMsg}</span>
              <span className="otp-timer">{countdown > 0 ? `Resend in ${countdown}s` : ""}</span>
            </div>

            <button className="otp-btn" onClick={() => void handleResetPassword()} disabled={resetting}>
              {resetting ? "Updating..." : "Reset password"}
            </button>

            <button className="otp-btn" onClick={() => void handleResendOtp()} disabled={!canResend}>
              {resending ? "Sending..." : "Resend OTP"}
            </button>

            <div className="otp-divider">or</div>
            <button className="otp-btn outline" onClick={goBack}>Change Email</button>
          </div>
        )}

        {step === "success" && (
          <div className="otp-success">
            <div className="otp-success-icon">✓</div>
            <h2>Password Reset</h2>
            <p>Your password has been changed.<br />Redirecting you to login...</p>
          </div>
        )}

        <p className="otp-footer">
          Remembered it?{" "}
          <a onClick={() => onNavigate("login")}>Back to login</a>
        </p>
      </div>
    </div>
  );
}
