import process from "process";
import child from "child_process";
import { open } from "fs/promises";
import { MarshalParser } from "./marshal";
import Handler from "./handlers/base";

function getCallSelfCommand() {
    // TODO (mut): Use shell quote for return value
    if (process.execPath == module.filename) {
        // Running in SEA mode
        return process.execPath;
    }
    return `${process.execPath} ${module.filename}`;
}

export async function run(command: string, handler: Handler, args: string[]) {
    const proc = child.spawn("p4", ["-G", command, ...args], {
        stdio: ["inherit", "pipe", "inherit"],
        env: {
            ...process.env,
            "P4EDITOR": `${getCallSelfCommand()} -E`,
        },
    });
    const parser = new MarshalParser();
    parser.begin();
    for await (const chunk of proc.stdout!) {
        parser.push(chunk);
        for (const item of parser.iter()) {
            handler.feed(item as Map<string, unknown>);
            handler.take(parser.buffers);
        }
    }
    parser.end();
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
