import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import gzip from 'rollup-plugin-gzip'
import filesize from 'rollup-plugin-filesize'
import pkg from './package.json'

const NODE_ENV = process.env.NODE_ENV
const isProductionBuild = NODE_ENV === 'production'
const jsFile = `.${NODE_ENV}.js`

const plugins = [
  babel({
    exclude: ['node_modules/**'],
    plugins: ['external-helpers']
  }),
  isProductionBuild && uglify({}, minify),
  isProductionBuild && gzip(),
  filesize()
]

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    globals: {
      react: 'React'
    },
    name: 'KickoffReactComponents',
    output: { file: pkg.browser + jsFile, format: 'umd' },
    sourcemap: isProductionBuild,
    plugins: [resolve(), commonjs(), ...plugins]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `output` option which can specify `file` and `format`)
  {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    output: [
      { file: pkg.main + jsFile, format: 'cjs' },
      { file: pkg.module + jsFile, format: 'es' }
    ],
    sourcemap: isProductionBuild,
    plugins: plugins
  }
]
