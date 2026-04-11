import React from "react";
import svgPaths from "./svg-njh21nspvy";
import imgImage4 from "../assets/3b46c74508bb1126c1fce42aad9b1ac457abfb67.png";
import { useAuth } from "../auth/AuthContext";
import { toast } from "sonner";
import { canReachAuthServer, createLocalDevAuthSession, isDevAuthNetworkError } from "../auth/authApi";

const HEIREDAI_API_BASE = (import.meta.env.VITE_HEIREDAI_API_URL || "http://localhost:8080").replace(/\/$/, "");

function Frame1() {
  return (
    <div className="box-border content-stretch flex flex-col items-center pb-[8px] pt-0 px-0 relative shrink-0 w-[192px]">
      <div
        className="mb-[-8px] relative shrink-0 size-[120px]"
        data-name="image 4"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImage4}
        />
      </div>
      <p className="font-['Poppins:Bold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[48px] text-neutral-800 w-[min-content]">
        Hired AI
      </p>
    </div>
  );
}

function EmailIconContainer() {
  return (
    <div
      className="absolute left-[12px] size-[20px] top-[16px]"
      data-name="Email Icon Container"
    >
      <svg className="block size-full" fill="none" viewBox="0 0 20 20">
        <path d={svgPaths.p34079a00} fill="#262626" />
      </svg>
    </div>
  );
}

const EmailInputContainer = React.forwardRef<HTMLInputElement>((props, ref) => {
  return (
    <div className="relative bg-[#f6f6f4] h-[52px] w-[408px] rounded-[8px] shadow-[0px_0px_1px_rgba(0,0,0,0.25)] flex items-center">
      <EmailIconContainer />
      <input
        ref={ref}
        type="email"
        placeholder="Email"
        className="w-full bg-transparent font-['Poppins:Regular',sans-serif] text-[#555c60] text-[18px] border-none outline-none text-center pl-[52px] pr-[52px]"
      />
    </div>
  );
});

function Group() {
  return (
    <div className="absolute inset-[9.68%]" data-name="Group">
      <div className="absolute inset-[-4.04%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 21 21"
        >
          <g id="Group">
            <path
              d={svgPaths.p8672780}
              id="Vector"
              stroke="var(--stroke-0, #262626)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d={svgPaths.p3e6a7c00}
              id="Vector_2"
              stroke="var(--stroke-0, #262626)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function HugeiconsLock() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[16px]">
      <Group />
    </div>
  );
}

const PasswordInputContainer = React.forwardRef<HTMLInputElement>((props, ref) => {
  return (
    <div className="relative bg-[#f6f6f4] h-[52px] w-[408px] rounded-[8px] shadow-[0px_0px_1px_rgba(0,0,0,0.25)] flex items-center">
      <HugeiconsLock />
      <input
        ref={ref}
        type="password"
        placeholder="Password"
        className="w-full bg-transparent font-['Poppins:Regular',sans-serif] text-[#555c60] text-[18px] border-none outline-none text-center pl-[52px] pr-[52px]"
      />
    </div>
  );
});

interface EmailAndPasswordContainerProps {
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
  onForgotPassword: () => void;
}

function EmailAndPasswordContainer({ emailRef, passwordRef, onForgotPassword }: EmailAndPasswordContainerProps) {
  return (
    <div
      className="absolute h-[166px] left-0 top-0 w-[408px]"
      data-name="Email and Password Container"
    >
      <EmailInputContainer ref={emailRef} />
      <div className="mt-3">
        <PasswordInputContainer ref={passwordRef} />
      </div>
      <button
        type="button"
        onClick={onForgotPassword}
        className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[283px] not-italic text-[13px] text-black text-nowrap top-[145px] whitespace-pre bg-transparent border-none cursor-pointer p-0 hover:underline"
      >
        Forgot password?
      </button>
    </div>
  );
}

// GITHUB LOGIN
function Group1() {
  const handleGithubLogin = async () => {
    console.log("Github Login Triggered");
    const authServerAvailable = await canReachAuthServer();
    if (!authServerAvailable) {
      toast.error("Auth backend is not running on port 8080. Start the auth backend and database, then try again.");
      return;
    }

    window.location.href =
      import.meta.env.VITE_GITHUB_OAUTH_URL ||
      `${HEIREDAI_API_BASE}/oauth2/authorization/github`;
  };

  return (
    <button
      onClick={() => void handleGithubLogin()}
      className="absolute inset-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity z-20"
      aria-label="Continue with GitHub"
    >
      <svg className="block size-full" fill="none" viewBox="0 0 35 35">
        <g id="Group">
          <path
            clipRule="evenodd"
            d={svgPaths.pa39d700}
            fill="black"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p26bb6e00}
            fill="black"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </button>
  );
}


function IconParkGithub() {
  return (
    <div className="absolute left-0 size-[35px] top-0" data-name="github">
      <Group1 />
    </div>
  );
}

// LINKEDIN LOGIN
function SkillIconsLinkedin() {
  const handleLinkedinLogin = async () => {
    console.log("LinkedIn Login Triggered");
    const authServerAvailable = await canReachAuthServer();
    if (!authServerAvailable) {
      toast.error("Auth backend is not running on port 8080. Start the auth backend and database, then try again.");
      return;
    }

    window.location.href =
      import.meta.env.VITE_LINKEDIN_OAUTH_URL ||
      `${HEIREDAI_API_BASE}/oauth2/authorization/linkedin`;
  };

  return (
    <button
      onClick={() => void handleLinkedinLogin()}
      className="absolute left-[53px] size-[35px] top-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity z-20"
      aria-label="Continue with LinkedIn"
    >
      <svg className="block size-full" fill="none" viewBox="0 0 35 35">
        <g id="Group">
          <path d={svgPaths.p2022e600} fill="white" />
          <path d={svgPaths.p2022e600} fill="#0A66C2" />
          <path d={svgPaths.p283ab300} fill="white" />
        </g>
      </svg>
    </button>
  );
}

// GOOGLE LOGIN
function DeviconGoogle() {
  const handleGoogleLogin = async () => {
    console.log("Google Login Triggered");
    const authServerAvailable = await canReachAuthServer();
    if (!authServerAvailable) {
      toast.error("Google sign-in is unavailable because the auth backend on port 8080 is not running.");
      return;
    }

    // window.location.href =
    //   import.meta.env.VITE_GOOGLE_OAUTH_URL ||
    //   "${VITE_RESUME_BUILDER_API_URL}/oauth2/authorization/google";
    window.location.href =
      import.meta.env.VITE_GOOGLE_OAUTH_URL ||
      `${HEIREDAI_API_BASE}/oauth2/authorization/google`;
  };

  return (
    <button
      onClick={() => void handleGoogleLogin()}
      className="absolute inset-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity z-20"
      aria-label="Continue with Google"
    >
      <svg className="block size-full" fill="none" viewBox="0 0 35 35">
        <g clipPath="url(#clip0_3_71)">
          <path d={svgPaths.p1d357f00} fill="white" />
          <path d={svgPaths.p8011000} fill="#E33629" />
          <path d={svgPaths.p3acd9c00} fill="#F8BD00" />
          <path d={svgPaths.p13376c80} fill="#587DBD" />
          <path d={svgPaths.p22f8bb00} fill="#319F43" />
        </g>
        <defs>
          <clipPath id="clip0_3_71">
            <rect fill="white" height="35" width="35" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function GoogleIcon() {
  // Changed "contents" to "inset-0" to maintain hit box
  return (
    <div className="absolute inset-0" data-name="google icon">
      <DeviconGoogle />
    </div>
  );
}

function SignInOptionsIconsContainer() {
  return (
    <div
      className="absolute left-[106px] size-[35px] top-0"
      data-name="Google Container"
    >
      <GoogleIcon />
    </div>
  );
}

function SocialButtonsFrame() {
  return (
    <div className="absolute h-[35px] left-[68px] top-[53px] w-[141px]">
      <IconParkGithub />
      <SkillIconsLinkedin />
      <SignInOptionsIconsContainer />
    </div>
  );
}

function SignInOptionsContainer({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div
      className="absolute h-[135px] left-[67px] top-[297px] w-[274px]"
      data-name="Sign In Options Container"
    >
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[137px] not-italic text-[20px] text-center text-neutral-800 text-nowrap top-0 translate-x-[-50%] whitespace-pre">
        Continue with
      </p>
      <SocialButtonsFrame />
      <p className="absolute left-0 right-0 font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[20px] text-center text-neutral-800 top-[111px]">
        <span className="font-['Poppins:Regular',sans-serif]">{`Don't have an account? `}</span>
        <button
          onClick={() => onNavigate("signin")}
          className="underline font-['Poppins:SemiBold',sans-serif] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity p-0"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

interface LoginbtnProps {
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
  onNavigate: (page: string) => void;
}

function Loginbtn({ emailRef, passwordRef, onNavigate }: LoginbtnProps) {
  const { refreshAuth } = useAuth();

  const handleLogin = async () => {
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      console.log("Attempting login for:", email);
      const response = await fetch(`${HEIREDAI_API_BASE}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      const raw = await response.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      console.log("Response data:", data);

      if (!response.ok) {
        alert(data?.Message || raw || `Login failed (${response.status})`);
        return;
      }

      if (data.Message === "User not registered") {
        alert("User not registered");
        return;
      }

      if (data.Message === "Invalid password") {
        alert("Invalid password");
        return;
      }

      if (data.Message === "Email not verified") {
        alert("Please verify your email with OTP before logging in.");
        onNavigate(`verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }

      createLocalDevAuthSession(email);
      await refreshAuth();
      onNavigate("dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (isDevAuthNetworkError(err)) {
        const fallbackUser = createLocalDevAuthSession(email);
        if (fallbackUser) {
          console.warn("Auth backend unavailable, using localhost dev session.");
          await refreshAuth();
          onNavigate("dashboard");
          return;
        }
      }

      alert("Unable to reach the login server. Start the auth backend or database, then try again.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="absolute bg-black h-[52px] left-0 rounded-[8px] text-white text-[18px] font-['Poppins:SemiBold',sans-serif] top-[166px] w-[408px] cursor-pointer hover:bg-gray-900 transition-colors z-20"
    >
      Log in
    </button>
  );
}

function LoginContainer({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const handleForgotPassword = () => {
    const email = emailRef.current?.value.trim();
    onNavigate(email ? `forgot-password?email=${encodeURIComponent(email)}` : "forgot-password");
  };

  return (
    <div
      className="absolute h-[432px] left-[209px] top-[364px] w-[408px] z-30"
      data-name="Login Container"
    >
      <div className="absolute h-[432px] left-0 top-0 w-[408px]">
        <EmailAndPasswordContainer
          emailRef={emailRef}
          passwordRef={passwordRef}
          onForgotPassword={handleForgotPassword}
        />
        <Loginbtn emailRef={emailRef} passwordRef={passwordRef} onNavigate={onNavigate} />
        <SignInOptionsContainer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function Frame2({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="absolute content-stretch flex flex-col gap-[13px] items-center left-[451px] top-[50px] w-[826px]">
      <Frame1 />
      {/* Background Box */}
      <div className="bg-white h-[709px] relative rounded-[20px] shrink-0 w-full z-0">
        <div
          className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[20px]"
        />
      </div>
      {/* Login Form (Elevated with z-index) */}
      <LoginContainer onNavigate={onNavigate} />
      <p className="absolute font-['Poppins:SemiBold',sans-serif] h-[48px] leading-[normal] left-1/2 not-italic text-[32px] text-center text-neutral-800 top-[250px] translate-x-[-50%] w-[360px] z-10">
        Log in to your account
      </p>
    </div>
  );
}

export default function LogInPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="bg-white relative size-full" data-name="log in page">
      <Frame2 onNavigate={onNavigate} />
    </div>
  );
}
