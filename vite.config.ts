import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// 💥 Rollup Replace プラグインをインポート (必要に応じて pnpm add -D @rollup/plugin-replace)
import replace from "@rollup/plugin-replace";

export default defineConfig(({ command }) => {
  if (command === "build") {
    // 空のモジュールに置き換えるための設定
    const replacePlugin = replace({
      preventAssignment: true,
      values: {
        'require("express")': '({})',
        'require("path")': '({})',
        'require("url")': '({})',
        // クライアント側で参照される可能性のある全てのサーバーモジュールを置き換え
        'express': '({})',
        'path': '({})',
        'url': '({})',
        'http': '({})',
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'index.ts'], // 自身のソースコードのみを対象
    });

    return {
      // 💥 修正: replace プラグインを最初に追加し、参照を消してから React プラグインを適用
      plugins: [
        replacePlugin, 
        react({ jsxRuntime: "automatic" }),
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, "index.ts"),
          name: "ReactGameUI",
          formats: ["es", "cjs"],
          fileName: (format) => `react-game-ui.${format}.js`,
        },
        rollupOptions: {
          external: [
            "react", 
            "react-dom", 
            // 外部化のリストは維持
            "express", 
            "path", 
            "url", 
            "http", 
            "socket.io",
            "socket.io-client" // 💥 クライアントモジュールも外部化
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
      },
    };
  } else {
    // 開発サーバー設定は変更なし
    return {
      plugins: [
        react({ jsxRuntime: "automatic" }),
      ],
      server: {
        host: true,
        port: 5173,
      },
    };
  }
});