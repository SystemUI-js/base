import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';

export default {
  input: 'src/lib/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
  },
  external: ['react', 'react-dom', 'react-dom/client', '@system-ui-js/chameleon', 'zustand'],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.lib.json' }),
    css({ output: 'styles.css' }),
  ],
};
