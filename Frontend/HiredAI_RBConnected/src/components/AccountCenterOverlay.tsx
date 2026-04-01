import React from "react";

interface Props {
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
}

export default function AccountCenterOverlay({
  onEditProfileClick,
  onChangePasswordClick,
}: Props) {
  return (
    <div className="absolute left-full top-1/2 z-50 ml-3 w-64 -translate-y-1/2 rounded-xl border border-gray-100 bg-white p-2 shadow-xl max-md:left-auto max-md:right-0 max-md:top-full max-md:mt-2 max-md:translate-y-0">
      <button
        onClick={onEditProfileClick}
        className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100 transition"
      >
        Edit Profile
      </button>

      <button
        onClick={onChangePasswordClick}
        className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100 transition"
      >
        Change Password
      </button>
    </div>
  );
}
