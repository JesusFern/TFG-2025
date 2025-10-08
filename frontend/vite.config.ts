import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isDocker = process.env.DOCKER_ENV === 'true';

const backendTarget = isDocker ? 'http://backend:5000' : 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: isDocker, 
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: isDocker,
    },
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});