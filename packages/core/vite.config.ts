import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// The consumer's `require` condition points at `index.d.cts`. Our types are identical across module
// systems, so mirror the rolled-up `.d.ts` to `.d.cts` once dts has written it.
const mirrorCts = () =>
  copyFileSync(
    resolve(__dirname, 'dist/index.d.ts'),
    resolve(__dirname, 'dist/index.d.cts')
  );

export default defineConfig({
  plugins: [
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
      name: 'Kumoha',
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['@tanuden/rudolf', 'socket.io-client', 'dequal']
    }
  }
});
