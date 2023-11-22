import child from "child_process";
import process from "process";
import { copyFile, readFile } from "fs/promises";
import { inject } from "postject";
import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["./src/cli.ts"],
    bundle: true,
    outdir: "dist",
    platform: "node",
    format: "cjs",
    sourcemap: true,
    banner: { "js": "#!/usr/bin/env node" },
});

await new Promise((resolve) => { child.spawn(process.execPath, ["--experimental-sea-config", "sea-config.json"], { stdio: "inherit" }).on("exit", resolve); })
    .then(() => copyFile(process.execPath, "dist/p4m"))
    .then(() => readFile("dist/sea-prep.blob"))
    .then((buffer) => inject("dist/p4m", "NODE_SEA_BLOB", buffer, { sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2" }));
