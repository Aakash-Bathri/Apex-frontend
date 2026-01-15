import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("oauth-success", "routes/oauth/oauth.tsx"),
  route("profile/:username", "routes/profile/profile.tsx"), // Public profile pages

  layout("routes/layouts/protectedRoutes.tsx", { id: "protected-layout" }, [
    route("logout", "routes/auth/logout.tsx"),
    route("profile", "routes/profile/profile.tsx"),
    route("dashboard", "routes/dashboard/dashboard.tsx"),
    route("leaderboard", "routes/leaderboard/leaderboard.tsx"),
  ]),
] satisfies RouteConfig;
