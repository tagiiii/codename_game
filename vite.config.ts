import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages にデプロイする場合は、リポジトリ名を base に設定してください
  // 例: base: '/codename_game/'
  base: process.env.GITHUB_ACTIONS ? '/codename_game/' : '/',
})
