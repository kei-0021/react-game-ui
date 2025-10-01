import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    // === ライブラリビルド用 ===
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, "index.ts"),
          name: "ReactGameUI",
          formats: ["es", "cjs"],
          fileName: (format) => `react-game-ui.${format}.js`,
        },
        rollupOptions: {
          // react/react-dom は利用者が持っている前提
          external: ["react", "react-dom"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
            },
          },
        },
      },
    };
  } else {
    // === 開発用 ===
    return {
      plugins: [react()],
      server: {
        host: true, // 0.0.0.0 にバインド
        port: 5173,
      },
    };
  }
});
