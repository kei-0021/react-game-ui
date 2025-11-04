import replace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// 💡 修正 1: resolve.alias を再導入 (TSファイルに必要なため維持)
const commonResolve = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};

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
      ...commonResolve, // 💡 エイリアスをビルドに適用
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
            // 💡 最終修正: アセットとCSSのファイル名を明確に指定
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                // CSSファイルを 'react-game-ui.css' としてルートに出力
                return 'react-game-ui.css'; 
              }
              // 画像アセット（PNGなど）は 'assets/' フォルダに強制出力
              // '[hash]' を削除し、より単純なパスにする
              return `assets/[name][extname]`; 
            },
          },
        },
        define: {
          "process.env.NODE_ENV": '"production"',
        },
        outDir: "dist",
        emptyOutDir: true,
        
        sourcemap: false,
        minify: 'terser', 
        
        // assetsDir も再導入し、Rollupの動作を上書き
        assetsDir: "assets",

        // アセットのインライン化の閾値を0に設定 (維持 - これが外部化の唯一のトリガー)
        assetsInlineLimit: 0,
      },
    };
  } else {
    // 🧩 開発モード
    return {
      ...commonResolve, // 💡 エイリアスを開発モードに適用
      root: path.resolve(__dirname, "tests"),
      plugins: [react({ jsxRuntime: "automatic" })],
      server: {
        host: true,
        port: 5173,
      },
    };
  }
});
