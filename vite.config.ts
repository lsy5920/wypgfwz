import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    figmaAssetResolver(),
    // React 与 Tailwind 插件用于构建前端页面，Cloudflare Pages 会直接运行同一套构建流程。
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // 将 @ 指向源码目录，便于后续模块化扩展。
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Cloudflare Pages 默认读取 dist 目录作为静态部署产物。
    outDir: 'dist',
    emptyOutDir: true,
  },

  // 支持作为资源直接引入的文件类型，不要把源码文件类型放到这里。
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
