import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.app.json', rollupTypes: true })],
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    lib: {
      name: 'Kumoha',
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['opentetsu']
    }
  }
});
