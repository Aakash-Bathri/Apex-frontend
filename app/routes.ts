import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("login", "routes/login/login.tsx"),
  route("oauth-success", "routes/oauth/oauth.tsx"),
] satisfies RouteConfig;
