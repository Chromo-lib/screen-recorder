import { terser } from "rollup-plugin-terser";

export default {
  input: "src/background/index.js",
  output: {
    file: "dist/background/index.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    process.env.NODE_ENV === 'production' ? terser() : ''
  ]
};