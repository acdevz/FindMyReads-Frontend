import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("token");
    const refreshToken = searchParams.get("refresh");
    const onboardingDone = searchParams.get("onboarding") === "true";

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      fetchApi("/api/me")
        .then((profile) => {
          setUser(profile);
          if (onboardingDone) {
            navigate("/home", { replace: true });
          } else {
            navigate("/onboarding/genres", { replace: true });
          }
        })
        .catch(() => {
          // Fallback
          navigate("/login", { replace: true });
        });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-label text-on-surface-variant animate-pulse uppercase tracking-widest text-xs font-bold">
          Authenticating with Google...
        </p>
      </div>
    </div>
  );
}
