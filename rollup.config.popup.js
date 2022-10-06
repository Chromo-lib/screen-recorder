import { terser } from "rollup-plugin-terser";

export default {
  input: "src/popup/index.js",
  output: {
    file: "dist/popup/index.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    process.env.NODE_ENV === 'production' ? terser() : ''
  ]
};