import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // console.log("Token stored:", token);

      // Use replace instead of navigate to avoid back button issues
      // Add a small delay to ensure localStorage is written
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } else {
      console.error("No token found in URL");
      // Redirect to login if no token
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "#0a0e27", color: "#BBE1FA" }}
    >
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: "#3282B8", borderTopColor: "transparent" }}
          ></div>
        </div>
        <p className="text-xl">Logging you in...</p>
      </div>
    </div>
  );
}

export default OAuthSuccess;
