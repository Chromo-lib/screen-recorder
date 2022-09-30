import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import { terser } from "rollup-plugin-terser";

console.log(process.env.NODE_ENV);

export default {
  input: "src/content/index.js",
  output: {
    file: "dist/content/index.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
        { find: 'react-dom', replacement: 'preact/compat' },
        { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
      ]
    }),
    nodeResolve({
      extensions: [".js"],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    babel({
      babelHelpers: 'runtime',
      presets: ["@babel/preset-react"],
      plugins: [
        ["@babel/plugin-transform-runtime"],
        ["@babel/plugin-transform-react-jsx", { pragma: "h", pragmaFrag: "Fragment", }]
      ],
    }),
    commonjs(),
    terser()
  ]
};