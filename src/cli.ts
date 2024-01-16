import HandlerMapping from "./handlers";
import { Buffers, BuffersConsumer } from "./common/buffers";
import { MarshalParser } from "./common/marshal";

import type Context from "./common/context";
import type Handler from "./handlers/base";

class CommandLineContext implements Context {

    async runP4<T>(command: string, args: string[], handler: Handler<T>): Promise<T> {
        function getCallSelfCommand() {
            function quote(s: string) {
                return `'${s.replaceAll("'", "'\"'\"'")}'`;
            }
            // If file is put under /$bunfs/, we assume that it is a compiled binary
            if (Bun.main.startsWith("/$bunfs/")) {
                return quote(process.execPath);
            }
            return `${quote(process.execPath)} ${quote(Bun.main)}`;
        }

        const proc = Bun.spawn({
            cmd: ["p4", "-G", command, ...args],
            stdio: ["inherit", "pipe", "inherit"],
            env: {
                ...process.env,
                "P4EDITOR": `${getCallSelfCommand()} --P4M-EDITOR`,
            },
        });
        const reader = proc.stdout.getReader();
        const buffers = new Buffers();
        const parser = new MarshalParser();
        let consumer: BuffersConsumer = parser;
        parser.begin();
        consumer.own(buffers);
        while (true) {
            const runResult = consumer.run();
            if (runResult.action == "request") {
                const readResult = await reader.read();
                if (readResult.done) {
                    if (consumer == handler) {
                        throw new Error("handler is requesting data but stream is closed");
                    }
                    break;
                }
                buffers.push(Buffer.from(readResult.value));
            } else if (runResult.action == "response") {
                consumer.disown();
                if (consumer == parser) {
                    handler.feed(runResult.value as Map<string, unknown>);
                }
                consumer = consumer == parser ? handler : parser;
                consumer.own(buffers);
            }
        }
        parser.end();
        await proc.exited;
        return handler.finalize();
    }

    newPager() {
        const proc = Bun.spawn({
            cmd: ["less", "-R"],
            stdio: ["pipe", "inherit", "inherit"],
        });
        return {
            write: (s: string = "") => { proc.stdin.write(s); },
            end: () => { proc.stdin.end(); },
            wait: async () => { await proc.exited; },
        };
    }

    printText(s: string = "", newline: boolean = true) {
        process.stdout.write(s);
        if (newline) {
            process.stdout.write("\n");
        }
    }

    printError(s: string = "", newline: boolean = true) {
        process.stderr.write(s);
        if (newline) {
            process.stderr.write("\n");
        }
    }

}

async function mainPassthrough(args: string[]) {
    const proc = Bun.spawn({
        cmd: ["p4", ...args],
        stdio: ["inherit", "inherit", "inherit"],
    });
    await proc.exited;
}

async function mainEditor(args: string[]) {
    async function generateVimArgs(args: string[]): Promise<string[]> {
        if (args.length != 1) {
            return [];
        }
        const file = await Bun.file(args[0]);
        const text = await file.text();
        const search = "<enter description here>";
        let currentPos: number = 0;
        let currentLine: number = 0;
        let enterFound: boolean = false;
        while (currentPos < text.length) {
            let nextLinePos = text.indexOf("\n", currentPos);
            if (nextLinePos == -1) {
                nextLinePos = text.length;
            }
            if (text.substring(currentPos, nextLinePos) === `\t${search}`) {
                enterFound = true;
                break;
            }
            currentPos = nextLinePos + 1;
            currentLine += 1;
        }
        if (enterFound) {
            return [`+${currentLine + 1}`, "-c", `s/${search}//`, "-c", "startinsert"];
        } else {
            return [];
        }
    }
    args.shift();
    const vimArgs = await generateVimArgs(args);
    const tty = Bun.file("/dev/tty");
    const proc = Bun.spawn({
        cmd: ["vim", ...vimArgs, ...args],
        stdio: [tty, tty, "inherit"],
    });
    await proc.exited;
}

async function main() {
    const args = process.argv.slice(2);
    if (!args[0]) {
        return await mainPassthrough(args);
    }
    if (args[0].substring(0, 1) === "-") {
        if (args[0].startsWith("--P4M-")) {
            if (args[0] == "--P4M-EDITOR") {
                return await mainEditor(args);
            }
            throw new Error(`unknown command override: ${args[0]}`);
        }
        return await mainPassthrough(args);
    }
    const handlerClass = HandlerMapping[args[0]];
    if (!handlerClass) {
        return await mainPassthrough(args);
    }
    const ctx = new CommandLineContext();
    const command = args.shift()!;
    const handler = new handlerClass(ctx, { root: true, args: args });
    const result = await ctx.runP4(command, args, handler);
    return result;
}

main();
