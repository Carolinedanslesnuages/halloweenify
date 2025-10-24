import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "tsconfig.json", useTsconfigDeclarationDir: true })
    ]
  },
  // CJS build — use named exports because the entry module has both default and named exports
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "tsconfig.json", useTsconfigDeclarationDir: true })
    ]
  }
];