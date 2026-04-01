import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchCurrentUser, updateProfileRequest } from "../auth/authApi";

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

/* -------------------- 100px Profile Icon -------------------- */
function UserProfileIcon() {
  return (
    <div className="relative w-[99px] h-[100px] rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#464646"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

interface EditProfileProps {
  onBackClick: () => void;
}

export default function EditProfile({ onBackClick }: EditProfileProps) {
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });
  const [initialData, setInitialData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          alert("Please log in again.");
          onBackClick();
          return;
        }

        const nextData = {
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          email: currentUser.email || "",
          mobileNumber: currentUser.mobile || "",
        };

        if (!active) return;
        setFormData(nextData);
        setInitialData(nextData);
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (active) {
          alert("Could not load your profile details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadUser();
    return () => {
      active = false;
    };
  }, [onBackClick]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileRequest({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobile: formData.mobileNumber.trim(),
      });
      await refreshAuth();
      alert("Profile updated successfully.");
      onBackClick();
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Could not update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
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
        Profile
      </h1>

      {/* Profile Card */}
      <div className="bg-[#f6f6f4] rounded-2xl px-8 py-8 max-w-[760px] mx-auto">
        {/* Profile Icon */}
        <div className="flex justify-center mb-6">
          <UserProfileIcon />
        </div>

        {/* Form Fields */}
        <div className="space-y-4 max-w-[650px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg h-12 flex items-center px-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                disabled={isLoading || isSaving}
                className="w-full text-[15px] text-[#464646] outline-none bg-transparent disabled:opacity-60"
              />
            </div>

            <div className="bg-white rounded-lg h-12 flex items-center px-4">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                disabled={isLoading || isSaving}
                className="w-full text-[15px] text-[#464646] outline-none bg-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg h-12 flex items-center px-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="E-mail"
              readOnly
              disabled
              className="w-full text-[15px] text-[#464646] outline-none bg-transparent cursor-not-allowed opacity-70"
            />
          </div>

          <div className="bg-white rounded-lg h-12 flex items-center px-4">
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="Mobile number"
              disabled={isLoading || isSaving}
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
            disabled={isLoading || isSaving}
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
