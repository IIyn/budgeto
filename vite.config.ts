import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

/** Native binaries, WASM and worker scripts loaded from disk: Node must load them as-is, never pre-bundled. */
const serverOnlyPackages = ['@napi-rs/canvas', 'tesseract.js', '@tesseract.js-data/fra', 'unpdf']

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  optimizeDeps: { exclude: serverOnlyPackages },
  ssr: { external: serverOnlyPackages, optimizeDeps: { exclude: serverOnlyPackages } },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    // Nitro is the deployment adapter only: the app model stays the same whatever the preset.
    nitro({
      preset: process.env.NITRO_PRESET ?? 'node-server',
      // Same packages in production: copied into .output with their files instead of being bundled.
      traceDeps: [...serverOnlyPackages.map((name) => `${name}*`), 'tesseract.js-core*'],
    }),
    viteReact(),
  ],
})
