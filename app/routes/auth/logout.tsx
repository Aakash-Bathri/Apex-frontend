import { redirect } from "react-router";

// clientAction runs in the browser when you submit a Form to this route
export async function clientAction() {
  localStorage.removeItem("token");
  return redirect("/");
}

// clientLoader runs in the browser when you navigate to this route via a Link
export async function clientLoader() {
  localStorage.removeItem("token");
  return redirect("/");
}

export default function Logout() {
  return null;
}
