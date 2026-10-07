import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    open: true,
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/loaders/GLTFLoader.js', 'lenis', 'lottie-web'],
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
