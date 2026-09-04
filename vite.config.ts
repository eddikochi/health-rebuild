import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funciona em domínio raiz (Vercel) e em subpath (GitHub Pages).
  base: "./",
  plugins: [react()],
});
