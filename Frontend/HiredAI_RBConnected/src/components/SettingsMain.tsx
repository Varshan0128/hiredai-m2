import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import EditProfile from "./EditProfile";
import ResumeHistory from "./ResumeHistory";
import ChangePassword from "./ChangePassword";
import { useAuth } from "../auth/AuthContext";
import { deleteAccountRequest } from "../auth/authApi";

type Screen =
  | "profile-menu"
  | "edit-profile"
  | "resume-history"
  | "change-password";

type Page = "home" | "dashboard" | "signin" | "login" | "resume1" | "resume2" | "resume3" | "jobs" | "templates" | "results" | "editor" | "settings";

export default function SettingsMain({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("profile-menu");
  const [showOverlay, setShowOverlay] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBackClick = () => {
    if (showOverlay || currentScreen !== "profile-menu") {
      setCurrentScreen("profile-menu");
      setShowOverlay(false);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    onNavigate("home");
  };

  const handleEditProfileClick = () => {
    setShowOverlay(false);
    setCurrentScreen("edit-profile");
  };

  const handleChangePasswordClick = () => {
    setShowOverlay(false);
    setCurrentScreen("change-password");
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      setShowOverlay(false);
      setCurrentScreen("profile-menu");
      onNavigate("home");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Could not log out right now. Please try again.");
    }
  };

  const handleDeleteAccountClick = async () => {
    const confirmed = window.confirm("Delete your account permanently? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteAccountRequest();
      try {
        await logout();
      } catch {
        // Account deletion already cleared auth cookie on server.
      }
      setShowOverlay(false);
      setCurrentScreen("profile-menu");
      onNavigate("home");
      alert("Your account has been deleted.");
    } catch (error) {
      console.error("Delete account failed:", error);
      alert("Could not delete account right now. Please try again.");
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      {currentScreen === "profile-menu" && (
        <ProfileMenu
          onAccountCenterClick={() => setShowOverlay(!showOverlay)}
          showAccountCenterOverlay={showOverlay}
          onCloseAccountCenter={() => setShowOverlay(false)}
          onEditProfileClick={handleEditProfileClick}
          onChangePasswordClick={handleChangePasswordClick}
          onBackClick={handleBackClick}
          onResumeHistoryClick={() => setCurrentScreen("resume-history")}
          onLogoutClick={() => void handleLogoutClick()}
          onDeleteAccountClick={() => void handleDeleteAccountClick()}
        />
      )}

      {currentScreen === "edit-profile" && (
        <div className="w-full min-h-screen overflow-hidden">
          <EditProfile onBackClick={handleBackClick} />
        </div>
      )}

      {currentScreen === "resume-history" && (
        <div className="w-full min-h-screen overflow-hidden">
          <ResumeHistory onBackClick={handleBackClick} />
        </div>
      )}

      {currentScreen === "change-password" && (
        <div className="w-full min-h-screen overflow-hidden">
          <ChangePassword onBackClick={handleBackClick} />
        </div>
      )}
    </div>
  );
}
