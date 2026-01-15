import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  // this is just to filter the unwanted console errors coming from chrome. did a patch. need to find a permanent solution
  server: {
    proxy: {
      "/.well-known/appspecific": {
        target: "http://localhost:3000", // This target doesn't matter much
        bypass: (req, res) => {
          res.statusCode = 204;
          res.end();
          return false; // Tells Vite to stop here and not forward the request
        },
      },
    },
  },
});
