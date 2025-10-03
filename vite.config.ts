// vite.config.ts
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  if (command === "build") {
    // === ライブラリビルド用 ===
    return {
      plugins: [
        react({
          // ビルド時は開発用 JSX を生成しない
          jsxRuntime: "automatic",
        }),
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, "index.ts"),
          name: "ReactGameUI",
          formats: ["es", "cjs"],
          fileName: (format) => `react-game-ui.${format}.js`,
        },
        rollupOptions: {
          // 利用者の React を使う（バンドルしない）
          external: ["react", "react-dom"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
            },
          },
        },
        define: {
          "process.env.NODE_ENV": '"production"',
        },
      },
    };
  } else {
    // === 開発用 ===
    return {
      plugins: [
        react({
          jsxRuntime: "automatic",
        }),
      ],
      server: {
        host: true, // 0.0.0.0 にバインド
        port: 5173,
      },
    };
  }
});
