import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      await refreshAuth();
      navigate("/dashboard", { replace: true });
    };

    void handleOAuthCallback();
  }, [navigate, refreshAuth]);

  return <p>Finalizing login...</p>;
}
