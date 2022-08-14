import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'
import { VitePluginFonts } from 'vite-plugin-fonts'

export default defineConfig({
  plugins: [
    react(),
    WindiCSS(),
    VitePluginFonts({
      google: {
        families: ['Roboto slab', 'Source Sans Pro'],
      },
    }),
  ],
  // optimizeDeps: {
  //   exclude: ['kysely']
  // },
  build: {
    target: "es2020"
  }
})
