import React, { useState } from "react";
import { changePasswordRequest } from "../auth/authApi";

/* -------------------- Clean Back Arrow -------------------- */
function BackArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

interface ChangePasswordProps {
  onBackClick: () => void;
}

export default function ChangePassword({ onBackClick }: ChangePasswordProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      alert("Please fill both password fields.");
      return;
    }

    setIsSaving(true);
    try {
      await changePasswordRequest({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      alert("Password updated successfully.");
      onBackClick();
    } catch (error) {
      console.error("Change password failed:", error);
      alert("Could not change password. Please verify your current password.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
    });
    onBackClick();
  };

  return (
    <div className="w-full h-full bg-white px-6 py-6 overflow-y-auto">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <BackArrow />
      </button>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-[#262626] text-center mt-4 mb-6">
        Change password
      </h1>

      {/* Password Card */}
      <div className="bg-[#f6f6f4] rounded-2xl px-8 py-8 max-w-[760px] mx-auto">
        {/* Form Fields */}
        <div className="space-y-4 max-w-[650px] mx-auto">
          {/* Current Password */}
          <div className="bg-white rounded-lg h-12 flex items-center px-4">
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Current password"
              disabled={isSaving}
              className="w-full text-[15px] text-[#464646] outline-none bg-transparent disabled:opacity-60"
            />
          </div>

          {/* New Password */}
          <div className="bg-white rounded-lg h-12 flex items-center px-4">
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New password"
              disabled={isSaving}
              className="w-full text-[15px] text-[#464646] outline-none bg-transparent disabled:opacity-60"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-white border border-black rounded-lg px-6 h-11 hover:opacity-70 transition"
          >
            <span className="text-sm font-semibold text-black">
              Cancel
            </span>
          </button>

          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="bg-black border border-black rounded-lg px-6 h-11 hover:opacity-80 transition"
          >
            <span className="text-sm font-semibold text-white">
              {isSaving ? "Saving..." : "Save changes"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
