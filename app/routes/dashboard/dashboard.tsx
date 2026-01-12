export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  return { user: "data" };
}

// This prevents the server from trying to run a loader at all
clientLoader.hydrate = true;

const DashBoard = () => {
  return <>Dashboard</>;
};

export default DashBoard;
