import { open as nodeOpen } from "node:fs/promises";
import { Texts } from "./consts";
import { MarshalParser } from "./marshal";
import Handler from "./handlers/base";

export async function run<T>(command: string, args: string[], handler: Handler<T>): Promise<T> {
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
    const parser = new MarshalParser();
    parser.begin();
    for await (const chunk of proc.stdout) {
        parser.push(Buffer.from(chunk));
        for (const item of parser.iter()) {
            handler.feed(item as Map<string, unknown>);
            handler.take(parser.buffers);
        }
    }
    parser.end();
    await proc.exited;
    return handler.finalize();
}

export async function runPassthrough(args: string[]) {
    const proc = Bun.spawn({
        cmd: ["p4", ...args],
        stdio: ["inherit", "inherit", "inherit"],
    });
    await proc.exited;
}

export async function runEditor(args: string[]) {
    async function generateVimArgs(args: string[]): Promise<string[]> {
        if (args.length != 1) {
            return [];
        }
        let enterLine: number = 0;
        let enterFound: boolean = false;
        const file = await Bun.file(args[0]);
        // TODO: Read files line-by-line instead of using text() and split()
        for await (const line of (await file.text()).split("\n")) {
            enterLine += 1;
            if (line === `\t${Texts.descriptionPlaceholder}`) {
                enterFound = true;
                break;
            }
        }
        if (enterFound) {
            return [`+${enterLine}`, "-c", `s/${Texts.descriptionPlaceholder}//`, "-c", "startinsert"];
        } else {
            return [];
        }
    }
    args.shift();
    const vimArgs = await generateVimArgs(args);
    // FIXME: Currently Bun returns a file descriptor for open(), and we relies on this behavior
    const tty = await nodeOpen("/dev/tty", "w+") as unknown as number;
    const proc = Bun.spawn({
        cmd: ["vim", ...vimArgs, ...args],
        stdio: [tty, tty, "inherit"],
    });
    await proc.exited;
}

export async function runPager() {
    const proc = Bun.spawn({
        cmd: ["less", "-R"],
        stdio: ["pipe", "inherit", "inherit"],
    });
    return {
        write: (s: string = "") => proc.stdin.write(s),
        end: () => proc.stdin.end(),
        wait: () => proc.exited,
    };
}
