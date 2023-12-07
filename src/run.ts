import { spawn } from "child_process";
import { open } from "fs/promises";
import { MarshalParser } from "./marshal";
import { generateVimArgs } from "./editor";
import Handler from "./handlers/base";

export async function run<T>(command: string, args: string[], handler: Handler<T>): Promise<T> {
    function getCallSelfCommand() {
        function quote(s: string) {
            return `'${s.replaceAll("'", "'\"'\"'")}'`;
        }
        if (process.execPath == module.filename) {
            // Running in SEA mode
            return quote(process.execPath);
        }
        return `${quote(process.execPath)} ${quote(module.filename)}`;
    }
    const proc = spawn("p4", ["-G", command, ...args], {
        stdio: ["inherit", "pipe", "inherit"],
        env: {
            ...process.env,
            "P4EDITOR": `${getCallSelfCommand()} --P4M-EDITOR`,
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
    await new Promise((resolve) => { proc.on("close", resolve); });
    return handler.finalize();
}

export async function runPassthrough(args: string[]) {
    const proc = spawn("p4", args, { stdio: "inherit" });
    await new Promise((resolve) => { proc.on("close", resolve); });
}

export async function runEditor(args: string[]) {
    args.shift();
    const vimArgs = await generateVimArgs(args);
    const tty = await open("/dev/tty", "w+");
    const proc = spawn("vim", [...vimArgs, ...args], { stdio: [tty.createReadStream(), tty.createWriteStream()] });
    await new Promise((resolve) => { proc.on("close", resolve); });
}

export async function runPager() {
    const proc = spawn("less", ["-R"], { stdio: ["pipe", "inherit", "inherit" ]});
    return {
        write: (s: string = "") => new Promise((resolve) => {
            proc.stdin.write(s, resolve);
        }),
        end: () => new Promise((resolve) => {
            proc.stdin.end(resolve);
        }),
        wait: () => new Promise((resolve) => {
            proc.on("exit", resolve);
        })
    };
}
