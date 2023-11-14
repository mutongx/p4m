import * as esbuild from 'esbuild';

esbuild.build({
    entryPoints: ["./src/index.ts", "./src/cli.ts"],
    bundle: true,
    outdir: "dist",
    platform: "node",
    format: "cjs",
})
