import React, { useEffect, useRef } from "react";
import svgPaths from "../imports/svg-apvu4a6ob3";
import AccountCenterOverlay from "./AccountCenterOverlay";

/* ================= BACK ARROW ================= */

function BackArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/* ================= MENU ICON ================= */

function MenuIcon({
  path,
  color = "black",
}: {
  path: string;
  color?: string;
}) {
  return (
    <div className="w-6 h-6 flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 57 57"
        className="w-full h-full"
        fill="none"
      >
        <path d={path} fill={color} />
      </svg>
    </div>
  );
}

/* ================= TYPES ================= */

interface ProfileMenuProps {
  onAccountCenterClick: () => void;
  showAccountCenterOverlay: boolean;
  onCloseAccountCenter: () => void;
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
  onBackClick: () => void;
  onResumeHistoryClick: () => void;
  onLogoutClick: () => void;
  onDeleteAccountClick: () => void;
}

/* ================= MAIN ================= */

export default function ProfileMenu({
  onAccountCenterClick,
  showAccountCenterOverlay,
  onCloseAccountCenter,
  onEditProfileClick,
  onChangePasswordClick,
  onBackClick,
  onResumeHistoryClick,
  onLogoutClick,
  onDeleteAccountClick,
}: ProfileMenuProps) {
  const accountCenterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAccountCenterOverlay) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountCenterRef.current &&
        !accountCenterRef.current.contains(event.target as Node)
      ) {
        onCloseAccountCenter();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccountCenterOverlay, onCloseAccountCenter]);

  return (
    <div className="min-h-screen w-full bg-white p-4 md:p-6">
      {/* Back */}
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 rounded-lg px-4 py-2 font-['Poppins:Medium',sans-serif] text-neutral-800 hover:bg-gray-100 transition"
      >
        <BackArrow />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Card */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-[#f6f6f4] rounded-2xl px-6 py-5">
          <div className="space-y-3">
            {/* Account center */}
            <div ref={accountCenterRef} className="relative w-full">
              <button
                onClick={onAccountCenterClick}
                className="flex items-center gap-4 w-full h-12 hover:opacity-70 transition"
              >
                <MenuIcon path={svgPaths.p30fe3a00} />
                <span className="text-[16px] font-medium">
                  Account center
                </span>
              </button>

              {showAccountCenterOverlay ? (
                <AccountCenterOverlay
                  onEditProfileClick={onEditProfileClick}
                  onChangePasswordClick={onChangePasswordClick}
                />
              ) : null}
            </div>

            {/* Resume history */}
            <button
              onClick={onResumeHistoryClick}
              className="flex items-center gap-4 w-full h-12 hover:opacity-70 transition"
            >
              <MenuIcon path={svgPaths.p3b983200} />
              <span className="text-[16px] font-medium">
                Resume history
              </span>
            </button>

            {/* Log out */}
            <button
              onClick={onLogoutClick}
              className="flex items-center gap-4 w-full h-12 hover:opacity-70 transition"
            >
              <MenuIcon path={svgPaths.p297c7080} />
              <span className="text-[16px] font-medium">
                Log out
              </span>
            </button>

            {/* Delete */}
            <button
              onClick={onDeleteAccountClick}
              className="flex items-center gap-4 w-full h-12 hover:opacity-70 transition"
            >
              <MenuIcon path={svgPaths.p20946000} color="#CE2828" />
              <span className="text-[16px] font-medium text-[#CE2828]">
                Delete account
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
