import yaml from '@modyfi/vite-plugin-yaml'
import { NodeGlobalsPolyfillPlugin as polyfill } from "@esbuild-plugins/node-globals-polyfill"

import { defineConfig } from 'vite'
export default {
  plugins: [
    yaml()
  ],
  server: {
    proxy: {
      '/rpc':  { target: 'http://localhost:9091', rewrite: path => path.replace(/^\/rpc/, '')  },
      '/rest': { target: 'http://localhost:1316', rewrite: path => path.replace(/^\/rest/, '') },
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define:  { global: "globalThis", },
      plugins: [ polyfill({ process: true, buffer: true }), ],
    },
  },
}
