import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages にデプロイする場合は、リポジトリ名を base に設定してください
  base: mode === 'production' ? '/codename_game/' : '/',
}))
