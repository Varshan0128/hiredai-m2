import { useSearchParams } from "react-router-dom";
import ForgotPassword from "../imports/ForgotPassword";
import PageBackButton from "./PageBackButton";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <>
      <PageBackButton variant="floating" fallbackTo="/login" />
      <ForgotPassword initialEmail={email} onNavigate={onNavigate} />
    </>
  );
}
