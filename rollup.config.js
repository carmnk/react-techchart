import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from "rollup-plugin-dts";
import { terser } from 'rollup-plugin-terser';

export default [{
    input: 'src/index.ts',
    output: [{
        file: 'output/index.js',
        format: 'cjs',
    },],
    external: [/node_modules/],
    // treeshake: false,
    plugins: [typescript(), commonjs(), resolve(), terser()] //({lib: ["es5", "es6", "dom"], target: "es5"})
},
{
    input: 'src/index.ts',
    output: [
        { file: "output/index.d.ts", format: "es" }],
    external: [/node_modules/],
    plugins: [typescript(), dts()] //({lib: ["es5", "es6", "dom"], target: "es5"})
}];