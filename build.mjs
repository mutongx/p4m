import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["./src/cli.ts"],
    bundle: true,
    outdir: "dist",
    platform: "node",
    format: "cjs",
    banner: { "js": "#!/usr/bin/env node" },
});
