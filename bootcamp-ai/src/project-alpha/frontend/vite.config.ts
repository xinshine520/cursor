import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pocketMockPlugin from 'pocket-mocker/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    pocketMockPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
