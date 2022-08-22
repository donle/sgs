import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
const alias = ['core','props','ui','assets','services','pages','utils','audio_loader','image_loader','electron_loader','languages','electron.port','client.config'].reduce((perv,item)=>{
     perv[item] = path.resolve(__dirname,`src/${item}`);
    return perv
},{})
// https://vitejs.dev/config/
export default defineConfig({
    define: {
    global: "globalThis",
  },
    esbuild: {
        define: {
          this: 'window'
         }
      },
  plugins: [react({
    babel: {
      parserOpts: { plugins: ["decorators-legacy"] },
    },
  })],
  resolve:{
      alias:{
        ...alias,
        "xmlhttprequest-ssl": "./node_modules/engine.io-client/lib/xmlhttprequest.js"
      }
  }
})