import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import svgPaths from "./svg-4t03ka39jz";
import imgImage4 from "figma:asset/3b46c74508bb1126c1fce42aad9b1ac457abfb67.png";
import { canReachAuthServer } from "../auth/authApi";
const HEIREDAI_API_BASE = (import.meta.env.VITE_HEIREDAI_API_URL || "http://localhost:8080").replace(/\/$/, "");

async function redirectToOAuth(provider: "github" | "google" | "linkedin") {
  const envUrlMap: Record<typeof provider, string | undefined> = {
    github: import.meta.env.VITE_GITHUB_OAUTH_URL,
    google: import.meta.env.VITE_GOOGLE_OAUTH_URL,
    linkedin: import.meta.env.VITE_LINKEDIN_OAUTH_URL,
  };

  const targetUrl = envUrlMap[provider] || `${HEIREDAI_API_BASE}/oauth2/authorization/${provider}`;
  const authServerAvailable = await canReachAuthServer();

  if (!authServerAvailable) {
    toast.error("Auth backend is not running on port 8080. Start the auth backend and database, then try again.");
    return;
  }

  window.location.href = targetUrl;
}

function Frame2() {
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

function PhUser() {
  return (
    <div
      className="absolute left-[12px] size-[20px] top-[18px]"
      data-name="ph:user"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="ph:user">
          <path
            d={svgPaths.p18d46f00}
            fill="var(--fill-0, black)"
            id="Vector"
            stroke="var(--stroke-0, #262626)"
            strokeWidth="0.6"
          />
        </g>
      </svg>
    </div>
  );
}

function UsernameField({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div
      className="absolute bg-[#f6f6f4] h-[56px] left-0 rounded-[8px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25)] top-0 w-[408px] flex items-center justify-center"
      data-name="Username Field"
    >
      <PhUser />
      <input
        type="text"
        name="username"
        value={value}
        onChange={onChange}
        placeholder="Username"
        className="
          w-full
          bg-transparent
          font-['Poppins:Regular',sans-serif]
          text-[#555c60]
          text-[18px]
          border-none
          outline-none
          text-center
        "
      />
    </div>
  );
}

function EmailIcon() {
  return (
    <div
      className="absolute left-[12px] size-[20px] top-[16px]"
      data-name="Email Icon"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Email Icon">
          <path
            d={svgPaths.p34079a00}
            fill="var(--fill-0, #262626)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function EmailField({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div
      className="absolute bg-[#f6f6f4] h-[52px] left-0 rounded-[8px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25)] top-[76px] w-[408px] flex items-center justify-center"
      data-name="Email Field"
    >
      <EmailIcon />
      <input
        type="email"
        name="email"
        value={value}
        onChange={onChange}
        placeholder="Email"
        className="
          w-full
          bg-transparent
          font-['Poppins:Regular',sans-serif]
          text-[#555c60]
          text-[18px]
          border-none
          outline-none
          text-center
        "
      />
    </div>
  );
}

function PhoneIcon() {
  return (
    <div
      className="absolute left-[12px] size-[20px] top-[18px]"
      data-name="Phone Icon"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Phone Icon">
          <path
            d={svgPaths.p77b2200}
            fill="var(--fill-0, #262626)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function PhoneField({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div
      className="absolute bg-[#f6f6f4] h-[56px] left-0 rounded-[8px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25)] top-[148px] w-[408px] flex items-center justify-center"
      data-name="Phone Field"
    >
      <PhoneIcon />
      <input
        type="tel"
        name="phone"
        value={value}
        onChange={onChange}
        placeholder="Phone"
        className="
          w-full
          bg-transparent
          font-['Poppins:Regular',sans-serif]
          text-[#555c60]
          text-[18px]
          border-none
          outline-none
          text-center
        "
      />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Group">
      <div className="absolute inset-[-3.33%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 24 24"
        >
          <g id="Group">
            <path
              d={svgPaths.p1a479500}
              id="Vector"
              stroke="var(--stroke-0, black)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d={svgPaths.p3ae71000}
              id="Vector_2"
              stroke="var(--stroke-0, black)"
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
    <div
      className="absolute left-[12px] overflow-clip size-[27px] top-[16px]"
      data-name="hugeicons:lock"
    >
      <Group />
    </div>
  );
}

function PasswordField({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div
      className="absolute bg-[#f6f6f4] h-[59px] left-0 rounded-[8px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25)] top-[224px] w-[408px] flex items-center justify-center"
      data-name="Password Field"
    >
      <HugeiconsLock />
      <input
        type="password"
        name="password"
        value={value}
        onChange={onChange}
        placeholder="Password"
        className="
          w-full
          bg-transparent
          font-['Poppins:Regular',sans-serif]
          text-[#555c60]
          text-[18px]
          border-none
          outline-none
          text-center
        "
      />
    </div>
  );
}

// FIX: Changed to <button> and added cursor-pointer + z-index
function LoginBtn({ onRegister }: { onRegister: () => void }) {
  return (
    <button
      onClick={onRegister}
      className="absolute bg-black border-none cursor-pointer flex gap-[10px] items-center justify-center left-0 px-[35px] py-[11px] rounded-[8px] top-[306px] w-[408px] z-50 hover:bg-neutral-800 transition-colors"
      data-name="login-btn"
    >
      <p className="font-['Poppins:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f6f6f4] text-[20px] text-nowrap whitespace-pre">{`Create account `}</p>
    </button>
  );
}

interface FormFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegister: () => void;
}

function FormFields({ formData, onChange, onRegister }: FormFieldsProps) {
  return (
    <div
      className="absolute h-[355px] left-1/2 -translate-x-1/2 top-0 w-[408px]"
      data-name="Form Fields"
    >
      <UsernameField value={formData.username} onChange={onChange} />
      <EmailField value={formData.email} onChange={onChange} />
      <PhoneField value={formData.phone} onChange={onChange} />
      <PasswordField value={formData.password} onChange={onChange} />
      <LoginBtn onRegister={onRegister} />
    </div>
  );
}

function Group1() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="Group">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 35 35"
      >
        <g id="Group">
          <path
            clipRule="evenodd"
            d={svgPaths.pa39d700}
            fill="var(--fill-0, black)"
            fillRule="evenodd"
            id="Vector"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p26bb6e00}
            fill="var(--fill-0, black)"
            fillRule="evenodd"
            id="Vector_2"
          />
        </g>
      </svg>
    </div>
  );
}

// FIX: Added cursor-pointer
function IconParkGithub() {
  return (
    <button
      onClick={() => void redirectToOAuth("github")}
      className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative shrink-0 cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-0"
      data-name="icon-park:github"
      aria-label="Continue with GitHub"
    >
      <Group1 />
    </button>
  );
}

function Group2() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="Group">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 35 35"
      >
        <g id="Group">
          <path
            d={svgPaths.p2022e600}
            fill="var(--fill-0, #F6F6F4)"
            id="Vector"
          />
          <path
            d={svgPaths.p2022e600}
            fill="var(--fill-0, #0A66C2)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p283ab300}
            fill="var(--fill-0, #F6F6F4)"
            id="Vector_3"
          />
        </g>
      </svg>
    </div>
  );
}

// FIX: Added cursor-pointer
function SkillIconsLinkedin() {
  return (
    <button
      onClick={() => void redirectToOAuth("linkedin")}
      className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative shrink-0 cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-0"
      data-name="skill-icons:linkedin"
      aria-label="Continue with LinkedIn"
    >
      <Group2 />
    </button>
  );
}

function DeviconGoogle() {
  return (
    <div
      className="[grid-area:1_/_1] ml-0 mt-0 relative size-[35px]"
      data-name="devicon:google"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 35 35"
      >
        <g clipPath="url(#clip0_6_2881)" id="devicon:google">
          <path
            d={svgPaths.p1d357f00}
            fill="var(--fill-0, #F6F6F4)"
            id="Vector"
          />
          <path
            d={svgPaths.p8011000}
            fill="var(--fill-0, #E33629)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p3acd9c00}
            fill="var(--fill-0, #F8BD00)"
            id="Vector_3"
          />
          <path
            d={svgPaths.p13376c80}
            fill="var(--fill-0, #587DBD)"
            id="Vector_4"
          />
          <path
            d={svgPaths.p22f8bb00}
            fill="var(--fill-0, #319F43)"
            id="Vector_5"
          />
        </g>
        <defs>
          <clipPath id="clip0_6_2881">
            <rect fill="white" height="35" width="35" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

// FIX: Added cursor-pointer
function GoogleIcon() {
  return (
    <button
      onClick={() => void redirectToOAuth("google")}
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-0"
      data-name="google icon"
      aria-label="Continue with Google"
    >
      <DeviconGoogle />
    </button>
  );
}

function SignInOptionsIconsContainer() {
  return (
    <div
      className="content-stretch flex gap-[37px] h-[35px] items-center justify-center relative shrink-0"
      data-name="Sign In Options Icons Container"
    >
      <GoogleIcon />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex gap-[18px] items-center left-[calc(50%-0.5px)] top-[45px] translate-x-[-50%] z-50">
      <IconParkGithub />
      <SkillIconsLinkedin />
      <SignInOptionsIconsContainer />
    </div>
  );
}

function SignInOptionsContainer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div
      className="absolute h-[131px] left-1/2 top-[392px] translate-x-[-50%] w-[334px]"
      data-name="Sign In Options Container"
    >
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(50%-1px)] not-italic text-[#4f4747] text-[20px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">
        Sign in With
      </p>
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[normal] left-[calc(50%-0.5px)] not-italic text-[20px] text-black text-center top-[105px] translate-x-[-50%] w-[327px]">
        <span className="font-['Poppins:Regular',sans-serif]">
          Already have an account?{" "}
        </span>
        <button
          onClick={() => onNavigate("login")}
          className="cursor-pointer font-['Poppins:SemiBold',sans-serif] text-neutral-800 underline bg-transparent border-none p-0"
        >
          Login
        </button>
      </div>
      <Frame1 />
    </div>
  );
}

function FormFieldsContainer({ formData, onChange, onRegister, onNavigate }: Frame3Props) {
  return (
    <div
      className="absolute h-[518px] left-0 top-0 w-[408px]"
      data-name="Form Fields Container"
    >
      <FormFields formData={formData} onChange={onChange} onRegister={onRegister} />
      <SignInOptionsContainer onNavigate={onNavigate} />
    </div>
  );
}

function FormContainer({ formData, onChange, onRegister, onNavigate }: Frame3Props) {
  return (
    <div
      className="absolute h-[534px] left-0 top-[101px] w-[408px]"
      data-name="Form Container"
    >
      <FormFieldsContainer formData={formData} onChange={onChange} onRegister={onRegister} onNavigate={onNavigate} />
    </div>
  );
}

// FIX: Added z-50 to ensure the whole form is on top
function Frame({ formData, onChange, onRegister, onNavigate }: Frame3Props) {
  return (
    <div className="absolute h-[624px] left-[209px] top-[238px] w-[408px] z-50">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[normal] left-[calc(50%-168px)] not-italic text-[32px] text-black text-nowrap top-[7px] whitespace-pre">
        Create your account
      </p>
      <FormContainer formData={formData} onChange={onChange} onRegister={onRegister} onNavigate={onNavigate} />
    </div>
  );
}

interface Frame3Props {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegister: () => void;
  onNavigate: (page: string) => void;
}

function Frame3({ formData, onChange, onRegister, onNavigate }: Frame3Props) {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-center left-[451px] top-[24px] w-[826px]">
      <Frame2 />
      <div className="bg-white h-[768px] relative rounded-[20px] shrink-0 w-full">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[20px]"
        />
      </div>
      <Frame formData={formData} onChange={onChange} onRegister={onRegister} onNavigate={onNavigate} />
    </div>
  );
}

export default function SignIn({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { username, email, phone, password } = formData;

    if (!username || !email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Mapping Username to firstName for now, assuming backend structure
      const payload = {
        firstName: username,
        lastName: "", // Optional or split username
        email: email,
        mobile: phone,
        password: password,
      };

      const response = await fetch(`${HEIREDAI_API_BASE}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.text(); // Backend returns String "Save" or similar

      if (response.ok) {
        const message = data || "Registration successful.";
        alert(message);

        if (message.toLowerCase().includes("log in now")) {
          onNavigate("login");
          return;
        }

        onNavigate(`verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        alert("Registration failed: " + data);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div
      className="bg-white relative size-full min-h-screen"
      data-name="sign in"
    >
      <Frame3
        formData={formData}
        onChange={handleChange}
        onRegister={handleRegister}
        onNavigate={onNavigate}
      />
    </div>
  );
}
