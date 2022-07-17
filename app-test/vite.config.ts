import { defineConfig } from 'vite'
import react from '@lucasols/vite-plugin-swc-react'
import reactBabel from '@vitejs/plugin-react'
// import swcReact from 'vite-plugin-swc-react'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [react(), Inspect()],
  build: {
    sourcemap: true,
  }
})
