import { useEffect, useMemo, useRef, useState } from "react";
import { sendOtpRequest, verifyOtpRequest } from "../auth/authApi";
import "./VerifyOtp.css";

type Step = "email" | "otp" | "success";

interface VerifyOtpProps {
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

export default function VerifyOtp({ initialEmail = "", onNavigate }: VerifyOtpProps) {
  const autoSendDoneRef = useRef(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [otpError, setOtpError] = useState(false);

  const canResend = step === "otp" && countdown <= 0 && !resending && !verifying;
  const validOtp = useMemo(() => /^\d{6}$/.test(otp.trim()), [otp]);

  useEffect(() => {
    if (step !== "otp") return;
    if (countdown <= 0) return;

    const id = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [step, countdown]);

  useEffect(() => {
    if (step !== "success") return;
    const id = window.setTimeout(() => {
      onNavigate("login");
    }, 1600);
    return () => window.clearTimeout(id);
  }, [step, onNavigate]);

  const startOtpStep = (sentToEmail: string) => {
    setStep("otp");
    setCountdown(30);
    setOtp("");
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
      startOtpStep(normalizedEmail);
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
    const normalizedEmail = email.trim();
    setResending(true);
    setStatusError(false);
    setStatusMsg("");
    try {
      await sendOtpRequest({ email: normalizedEmail });
      setCountdown(30);
      setOtp("");
      setStatusMsg(`New OTP sent to ${normalizedEmail}`);
    } catch (error) {
      setStatusError(true);
      setStatusMsg(messageFromError(error, "Failed to resend OTP."));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!validOtp) {
      setOtpError(true);
      setStatusError(true);
      setStatusMsg("Enter a valid 6-digit OTP.");
      window.setTimeout(() => setOtpError(false), 500);
      return;
    }

    setVerifying(true);
    setStatusError(false);
    setStatusMsg("");
    try {
      await verifyOtpRequest({ email: email.trim(), otp: otp.trim() });
      setStep("success");
    } catch (error) {
      setOtpError(true);
      setStatusError(true);
      setStatusMsg(messageFromError(error, "OTP verification failed."));
      window.setTimeout(() => setOtpError(false), 500);
    } finally {
      setVerifying(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setCountdown(30);
    setOtp("");
    setStatusMsg("");
    setStatusError(false);
    setOtpError(false);
  };

  const handleEnterKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (step === "email" && !sending) {
      void handleSendOtp();
      return;
    }
    if (step === "otp" && !verifying) {
      void handleVerify();
    }
  };

  return (
    <div id="otp-verification-page" onKeyDown={handleEnterKey}>
      <div className="otp-card">
        <div className="otp-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="otp-steps">
          <div className={`otp-step ${step === "email" ? "active" : step === "otp" || step === "success" ? "done" : ""}`} />
          <div className={`otp-step ${step === "otp" ? "active" : step === "success" ? "done" : ""}`} />
        </div>

        <h1 className="otp-title">Verify Your<br />Identity</h1>
        <p className="otp-subtitle">
          {step === "success"
            ? "Your verification is complete."
            : step === "otp"
            ? "Enter the one-time password sent to your email."
            : "Enter your email address to receive a one-time password."}
        </p>

        {step === "email" && (
          <div>
            <div className="otp-field">
              <label className="otp-label" htmlFor="verify-email">Email Address</label>
              <input
                id="verify-email"
                type="email"
                className="otp-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="off"
                disabled={sending}
              />
            </div>

            {statusMsg && (
              <div className={`otp-status ${statusError ? "error" : ""}`}>{statusMsg}</div>
            )}

            <button className="otp-btn" onClick={() => void handleSendOtp()} disabled={sending}>
              {sending ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <div className="otp-field">
              <label className="otp-label" htmlFor="verify-otp">Verification Code</label>
              <input
                id="verify-otp"
                type="tel"
                className={`otp-input ${otpError ? "error" : ""}`}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="one-time-code"
                disabled={verifying}
              />
            </div>

            <div className="otp-timer-wrap">
              <span className={`otp-status ${statusError ? "error" : ""}`}>{statusMsg}</span>
              <span className="otp-timer">{countdown > 0 ? `Resend in ${countdown}s` : ""}</span>
            </div>

            <button className="otp-btn" onClick={() => void handleVerify()} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify OTP"}
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
            <h2>Verified!</h2>
            <p>Your identity has been confirmed.<br />Redirecting you now...</p>
          </div>
        )}

        <p className="otp-footer">
          Don&apos;t have an account?{" "}
          <a onClick={() => onNavigate("signin")}>Sign up free</a>
        </p>
      </div>
    </div>
  );
}
