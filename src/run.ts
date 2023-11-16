import process from "process";
import child from "child_process";
import { open } from "fs/promises";
import { MarshalParser } from "./marshal";
import Handler from "./handlers/base";

export async function run(command: string, handler: Handler, args: string[]) {
    const proc = child.spawn("p4", ["-G", command, ...args], {
        stdio: ["pipe", "pipe", "inherit"],
        env: {
            ...process.env,
            "P4EDITOR": `${process.argv[0]} ${process.argv[1]} -E`,
        },
    });
    const parser = new MarshalParser(proc.stdout!);
    for await (const obj of parser.consume()) {
        const item = obj as Map<string, unknown>;
        handler.feed(item);
    }
    await new Promise((resolve) => { proc.on("exit", resolve); });
    return await handler.finalize();
}

export async function runPassthrough(args: string[]) {
    const proc = child.spawn("p4", args, { stdio: "inherit" });
    await new Promise((resolve) => { proc.on("exit", resolve); });
}

export async function runEditor(args: string[]) {
    args.shift();
    const tty = await open("/dev/tty", "w+");
    const proc = child.spawn("vim", args, { stdio: [tty.createReadStream(), tty.createWriteStream()] });
    await new Promise((resolve) => { proc.on("exit", resolve); });
}
