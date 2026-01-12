import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/"); // or dashboard
    }
  }, []);

  return <p>Logging you in...</p>;
}

export default OAuthSuccess;
