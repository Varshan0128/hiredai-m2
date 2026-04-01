import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageBackButtonProps {
  fallbackTo?: string;
  label?: string;
  onClick?: () => void;
  variant?: "floating" | "inline";
  className?: string;
}

export default function PageBackButton({
  fallbackTo = "/",
  label = "Back",
  onClick,
  variant = "inline",
  className = "",
}: PageBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  const baseClassName = variant === "floating"
    ? "fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-800 bg-white px-4 py-2 text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
    : "flex items-center gap-2 rounded-lg border border-neutral-800 bg-white px-4 py-2 font-['Poppins:Medium',sans-serif] text-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-gray-100";

  return (
    <motion.button
      onClick={handleClick}
      className={`${baseClassName} ${className}`.trim()}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.96 }}
      aria-label={label}
    >
      <ArrowLeft size={20} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
