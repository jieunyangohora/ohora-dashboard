import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Vercel 배포 시 자산 경로를 상대 경로로 안전하게 고정
  build: {
    chunkSizeWarningLimit: 1000, // 빌드 경고 리밋 상향
  }
})