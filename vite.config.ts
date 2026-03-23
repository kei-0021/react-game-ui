import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const commonResolve = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-game-ui': path.resolve(__dirname, 'src/index.ts'),
    },
  },
};

export default defineConfig(({ command }) => {
  if (command === 'build') {
    const replacePlugin = replace({
      preventAssignment: true,
      values: {
        'require("express")': '({})',
        'require("path")': '({})',
        'require("url")': '({})',
        express: '({})',
        path: '({})',
        url: '({})',
        http: '({})',
      },
      include: ['src/index.ts'],
    });

    return {
      ...commonResolve,
      plugins: [
        react({ jsxRuntime: 'automatic' }),
        {
          ...replacePlugin,
          enforce: 'post',
        },
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'ReactGameUI',
          formats: ['es', 'cjs'],
          fileName: (format) => `react-game-ui.${format}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'express', 'path', 'url', 'http', 'socket.io', 'socket.io-client'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'react-game-ui.css';
              }
              return `assets/[name][extname]`;
            },
          },
        },
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'terser',
        assetsDir: 'assets',
        assetsInlineLimit: 0,
      },
    };
  } else {
    return {
      ...commonResolve,
      root: path.resolve(__dirname, 'tests'),
      plugins: [react({ jsxRuntime: 'automatic' })],
      server: {
        host: true,
        port: 5173,
      },
    };
  }
});
