import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const dirDest = 'lib';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: `${dirDest}/index.cjs.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `${dirDest}/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({
      extract: false,
      inject: true
    }),
    copy({
      targets: [
        { src: 'src/types/*.d.ts', dest: `${dirDest}/types` }
      ]
    })
  ],
  external: ['react', 'react-dom'],
};
