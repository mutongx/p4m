import { spawn } from "child_process";
import { run, runPassthrough, runEditor } from "./run";
import handlerMapping from "./handlers";

async function main() {
    const args = process.argv.slice(2);
    if (!args[0]) {
        return await runPassthrough(args);
    }
    if (args[0].substring(0, 1) === "-") {
        if (args[0].startsWith("--P4M-")) {
            if (args[0] == "--P4M-EDITOR") {
                return await runEditor(args);
            }
            throw new Error(`unknown command override: ${args[0]}`);
        }
        return await runPassthrough(args);
    }
    const handlerClass = handlerMapping[args[0]];
    if (!handlerClass) {
        return await runPassthrough(args);
    }
    const command = args.shift()!;
    const handler = new handlerClass({ root: true, args: args });
    const pager = handler.flags().pager ? spawn("less", ["-R"], { stdio: ["pipe", "inherit", "inherit"] }) : null;
    if (pager) {
        handler.stream = pager.stdin;
    }
    const result = await run(command, args, handler);
    if (pager) {
        pager.stdin.end();
        await new Promise((resolve) => { pager.on("exit", resolve); });
    }
    return result;
}

main();
