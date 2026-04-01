import { useSearchParams } from "react-router-dom";
import VerifyOtp from "../imports/VerifyOtp";
import PageBackButton from "./PageBackButton";

interface VerifyOtpPageProps {
  onNavigate: (page: string) => void;
}

export default function VerifyOtpPage({ onNavigate }: VerifyOtpPageProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <>
      <PageBackButton variant="floating" fallbackTo="/login" />
      <VerifyOtp initialEmail={email} onNavigate={onNavigate} />
    </>
  );
}
