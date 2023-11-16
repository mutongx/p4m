import process from "process";
import child from "child_process";
import { open } from "fs/promises";
import { MarshalParser } from "./marshal";
import p4cmd from "./p4cmd";

async function run(args: string[]) {
    const action = args[0];
    args.unshift("-G");
    const proc = child.spawn("p4", args, {
        stdio: ["pipe", "pipe", "inherit"],
        env: {
            ...process.env,
            "P4EDITOR": `${process.argv[0]} ${process.argv[1]} -E`,
        },
    });
    const command = new p4cmd[action]!();
    const parser = new MarshalParser(proc.stdout!);
    for await (const obj of parser.consume()) {
        const item = obj as Map<string, unknown>;
        command.feed(item);
    }
    await new Promise((resolve) => { proc.on("exit", resolve); });
    return await command.finalize();
}

async function runPassthrough(args: string[]) {
    const proc = child.spawn("p4", args, { stdio: "inherit" });
    await new Promise((resolve) => { proc.on("exit", resolve); });
}

async function runEditor(args: string[]) {
    args.shift();
    const tty = await open("/dev/tty", "w+");
    const proc = child.spawn("vim", args, { stdio: [tty.createReadStream(), tty.createWriteStream()] });
    await new Promise((resolve) => { proc.on("exit", resolve); });
}

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
    if (!p4cmd[args[0]]) {
        return await runPassthrough(args);
    }
    return await run(args);
}

main();
