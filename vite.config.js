import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/Namma-Krishi-App-Final/" : "/",
  plugins: [react()],
});
