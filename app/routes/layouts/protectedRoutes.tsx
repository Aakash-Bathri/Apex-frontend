import { Outlet, redirect } from "react-router";

export async function clientLoader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/dashboard`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.status === 401) {
      localStorage.removeItem("token");
      return redirect("/login");
    }

    if (!res.ok) throw new Error("Failed to fetch dashboard data");

    const data = await res.json();
    console.log(data);
    return data; // This data will be available to all child routes via useRouteLoaderData
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    // Temporary debugging: Alert the user to see what went wrong
    if (typeof window !== "undefined") {
      alert(`Login failed: ${error.message || "Unknown error"}. Check console for details.`);
    }

    localStorage.removeItem("token");
    return redirect("/login");
  }
}

// Ensures the check runs every time you navigate between protected pages
clientLoader.hydrate = true;

export default function ProtectedLayout() {
  return (
    <div>
      {/* You can add a Sidebar or Navbar here that only logged-in users see */}
      <Outlet />
    </div>
  );
}
