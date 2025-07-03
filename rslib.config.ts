import { defineConfig } from '@rslib/core'
import pkg from './package.json'

const product = process.env.NODE_ENV === 'prd';
const FILEMANE = pkg.name;
const sourceMap = !product;
const banner = `/*!\n * ${pkg.name} v${pkg.version}\n  */`;

export default defineConfig({
    lib: [
        {
            format: "esm",
            banner: {
                js: banner
            },
            output: {
                filename: {
                    js: `${FILEMANE}.es.js`
                }
            },
            dts: true
        },
        {
            format: "umd",
            banner: {
                js: banner
            },
            output: {
                filename: {
                    js: `${FILEMANE}.umd.js`
                },
                externals: {
                    'maptalks': "window maptalks"
                },
                sourceMap: sourceMap,
                legalComments: "none",
            },
            tools: {
                rspack: {
                    output: {
                        library: {
                            name: "maptalks",
                            type: "assign-properties"
                        }
                    },
                }
            }
        }
    ]
})