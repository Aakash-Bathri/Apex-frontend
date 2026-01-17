import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // DEBUG: Alert to confirm token reception
      alert("OAuth Success! Token received: " + token.substring(0, 10) + "...");
      console.log("OAuth Token:", token);

      localStorage.setItem("token", token);

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } else {
      console.error("No token found in URL");
      alert("OAuth Error: No token found in URL parameters!");
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
