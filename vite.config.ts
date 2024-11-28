import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // server: {
//   //   proxy: {
//   //     "/api": {
//   //       target: "https://test.vmarmysh.com",
//   //       changeOrigin: true,
//   //       rewrite: (path) => path.replace(/^\/api/, ""),
//   //     },
//   //   },
//   // },

// });

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8800",
    },
  },
  plugins: [react()],
});
