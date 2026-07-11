import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

const mirrorCts = () =>
  copyFileSync(
    resolve(__dirname, 'dist/index.d.ts'),
    resolve(__dirname, 'dist/index.d.cts')
  );

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
      afterBuild: mirrorCts
    })
  ],
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    lib: {
      name: 'KumohaReact',
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@tanuden\//,
        /^zustand($|\/)/
      ]
    }
  }
});
