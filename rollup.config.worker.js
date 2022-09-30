import { terser } from "rollup-plugin-terser";

console.log(process.env.NODE_ENV);

export default {
  input: "src/background/index.js",
  output: {
    file: "dist/background/index.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    terser()
  ]
};