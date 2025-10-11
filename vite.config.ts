import replace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  if (command === "build") {
    // 🧩 ライブラリビルド時の置き換え設定（サーバー依存を除去）
    const replacePlugin = replace({
      preventAssignment: true,
      values: {
        'require("express")': '({})',
        'require("path")': '({})',
        'require("url")': '({})',
        'express': '({})',
        'path': '({})',
        'url': '({})',
        'http': '({})',
      },
      include: ["src/**/*.ts", "src/**/*.tsx", "src/index.ts"],
    });

    return {
      plugins: [
        replacePlugin,
        react({ jsxRuntime: "automatic" }),
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          name: "ReactGameUI",
          formats: ["es", "cjs"],
          fileName: (format) => `react-game-ui.${format}.js`,
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "express",
            "path",
            "url",
            "http",
            "socket.io",
            "socket.io-client",
          ],
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
        outDir: "dist",
        emptyOutDir: true,
        
        // 🚨 最終修正 1: デバッグ情報を完全に削除し、jsxDEV の残骸を断ち切る
        sourcemap: false,
        minify: 'terser', 
      },
    };
  } else {
    // 🧩 開発モード（デモ・テストUIを tests/ から配信）
    return {
      root: path.resolve(__dirname, "tests"),
      plugins: [react({ jsxRuntime: "automatic" })],
      server: {
        host: true,
        port: 5173,
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
          // ⚠️ 重要な修正: React, ReactDOMのエイリアスは削除済み
        },
      },
    };
  }
});