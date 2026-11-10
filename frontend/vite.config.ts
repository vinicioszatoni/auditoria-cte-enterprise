/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function vendorChunkName(id: string) {
  const normalized = id.replaceAll('\\', '/')
  const match = normalized.match(/\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:@([^/]+)\/)?([^/]+)/)
  if (!match) return undefined

  const [, , pkg] = match
  if (!pkg || pkg.startsWith('.')) return undefined

  return pkg ? `vendor-${pkg}` : undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_PUBLIC_URL,
    plugins: [react()],
    server: {
      port: 3000
    },
    build: {
      target: 'es2020',
      rolldownOptions: {
        output: {
          codeSplitting: {
            minSize: 20_000,
            maxSize: 400_000,
            includeDependenciesRecursively: false,
            groups: [
              {
                name: vendorChunkName,
                test: /[\\/]node_modules[\\/]/
              }
            ]
          }
        }
      }
    }
  }
})
