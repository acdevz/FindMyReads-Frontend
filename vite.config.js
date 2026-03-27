import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig((mode) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      // basicSsl(),
    ],

    server: {
      host: true,
      proxy: {
        "/api": {
          target: env.BACKEND_URL,
          changeOrigin: true,
        },
        "/oauth2": {
          target: env.BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
