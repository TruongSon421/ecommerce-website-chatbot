import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'localhost', 
      '127.0.0.1',
      '.ngrok-free.app', // Cho phép tất cả subdomain ngrok
      'dev.truongson.shop', // Hoặc chỉ định cụ thể
    ]
  }
})