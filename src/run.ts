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
        const file = await Bun.file(args[0]);
        const text = await file.text();
        const search = `\t${Texts.descriptionPlaceholder}`;
        let currentPos: number = 0;
        let currentLine: number = 0;
        let enterFound: boolean = false;
        while (currentPos < text.length) {
            let nextLinePos = text.indexOf("\n", currentPos);
            if (nextLinePos == -1) {
                nextLinePos = text.length;
            }
            if (text.substring(currentPos, nextLinePos) === search) {
                enterFound = true;
                break;
            }
            currentPos = nextLinePos + 1;
            currentLine += 1;
        }
        if (enterFound) {
            return [`+${currentLine + 1}`, "-c", `s/${Texts.descriptionPlaceholder}//`, "-c", "startinsert"];
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
