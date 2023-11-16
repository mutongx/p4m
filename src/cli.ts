import { run, runPassthrough, runEditor } from "./run";
import handlerMapping from "./handlers";

async function main() {
    const args = process.argv.slice(2);
    if (!args[0]) {
        return await runPassthrough(args);
    }
    if (args[0].substring(0, 1) === "-") {
        if (args[0] == "-E") {
            return await runEditor(args);
        }
        return await runPassthrough(args);
    }
    const handlerClass = handlerMapping[args[0]];
    if (!handlerClass) {
        return await runPassthrough(args);
    }
    const command = args.shift()!;
    const handler = new handlerClass();
    return await run(command, handler, args);
}

main();
