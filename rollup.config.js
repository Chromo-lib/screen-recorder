import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { terser } from "rollup-plugin-terser";
import { replaceWord } from './plugin';
import {readFileSync, writeFileSync} from 'fs'
import { resolve } from 'path';

console.log('process ===> ',process.env.BROWSER,process.env.NODE_ENV);
const isChrome = process.env.BROWSER === 'chrome';

const from = isChrome ? 'browser' : 'chrome';
const to = isChrome ? 'chrome' : 'browser';

if(!isChrome) {
  const content = readFileSync(resolve(process.cwd(), 'src', 'manifest-firefox.json'), 'utf8');
  writeFileSync(resolve(process.cwd(), 'dist', 'manifest.json'), content)
}

export default [
  {
    input: "src/background/index.js",
    output: {
      file: "dist/background/index.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  },
  {
    input: "src/popup/index.js",
    output: {
      file: "dist/popup/index.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  },
  {
    input: "src/permission/index.js",
    output: {
      file: "dist/permission/index.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  },
  {
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
      babel({
        babelHelpers: 'runtime',
        presets: ["@babel/preset-react"],
        plugins: [
          "@babel/plugin-transform-runtime",
          ["@babel/plugin-transform-react-jsx", { pragma: "h", pragmaFrag: "Fragment", }]
        ],
      }),
      commonjs(),
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  }
]
