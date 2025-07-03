import { defineConfig } from '@rslib/core'

// maptalks.snap

export default defineConfig({
    lib: [
        {
            format: "esm",
            output: {
                filename: {
                    js: "maptalks.snap.es.js"
                }
            }
        },
        {
            format: "umd",
            output: {
                filename: {
                    js: "maptalks.snap.umd.min.js"
                },
                externals: {
                    'maptalks': "window maptalks"
                },
                minify: {
                    js: true
                },
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
        },
        {
            format: "umd",
            output: {
                filename: {
                    js: "maptalks.snap.umd.js"
                },
                externals: {
                    'maptalks': "window maptalks"
                },
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