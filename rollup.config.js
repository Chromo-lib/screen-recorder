import { readFileSync, writeFileSync } from 'fs'
import path, { resolve } from 'path';
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import { terser } from "rollup-plugin-terser";
import { replaceWord } from './plugin';

const pkg = require('./package.json');

console.log('Process ===> ', process.env.BROWSER, process.env.NODE_ENV);

const isChrome = process.env.BROWSER === undefined ? true : process.env.BROWSER === 'chrome';
const from = isChrome ? 'browser' : 'chrome';
const to = isChrome ? 'chrome' : 'browser';

if (!isChrome) {
  const content = readFileSync(resolve(process.cwd(), 'manifest-v2.json'), 'utf8');
  writeFileSync(resolve(process.cwd(), 'dist', 'manifest.json'), content);
}

const isProduction = process.env.NODE_ENV === 'production';
const banner = `/*! Reco - v${pkg.version} | Copyright 2022 - Haikel Fazzani */\n`;

export default [
  {
    input: "src/background/index.js",
    output: {
      file: "dist/background.js",
      format: "iife",
      sourcemap: !isProduction,
      banner
    },
    plugins: [
      replaceWord({ from, to }),
      isProduction ? terser() : ''
    ]
  },
  {
    input: "src/editor/index.js",
    output: {
      file: "dist/editor.js",
      format: "iife",
      sourcemap: !isProduction,
      banner
    },
    plugins: [
      postcss({
        extract: true,
        minimize: isProduction,
        extract: path.resolve('dist/editor.css')
      }),
      replaceWord({ from, to }),
      isProduction ? terser() : ''
    ]
  },
  {
    input: "src/permission/index.js",
    output: {
      file: "dist/permission.js",
      format: "iife",
      sourcemap: !isProduction,
      banner
    },
    plugins: [
      postcss({
        extract: true,
        minimize: isProduction,
        extract: path.resolve('dist/permission.css')
      }),
      replaceWord({ from, to }),
      isProduction ? terser() : ''
    ]
  },
  {
    input: "src/popup/index.js",
    output: {
      file: "dist/popup.js",
      format: "iife",
      sourcemap: !isProduction,
      banner
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
      postcss({
        extract: true,
        minimize: isProduction,
        extract: path.resolve('dist/popup.css')
      }),
      commonjs(),
      replaceWord({ from, to }),
      isProduction ? terser() : ''
    ]
  },
  {
    input: "src/content/index.js",
    output: {
      file: "dist/content.js",
      format: "iife",
      sourcemap: !isProduction,
      banner
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
      postcss({
        extract: true,
        minimize: isProduction,
        extract: path.resolve('dist/content.css')
      }),
      commonjs(),
      replaceWord({ from, to }),
      isProduction ? terser() : ''
    ]
  }
];