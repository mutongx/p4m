import process from "process";
import child from "child_process";
import { open } from "fs/promises";
import { MarshalParser } from "./marshal";

async function runWithParse(args: string[]) {
    args.unshift("-G");
    const proc = child.spawn("p4", args, {
        stdio: ["pipe", "pipe", "inherit"],
        env: {
            ...process.env,
            "P4EDITOR": `${process.argv[0]} ${process.argv[1]} -E`
        },
    });
    const m = new MarshalParser(proc.stdout!);
    for await (const obj of m.consume()) {
        const item = obj as Map<string, string>;
        const code = item.get("code");
        item.delete("code");
        switch (code) {
        case "info":
            console.log(item.get("data")?.trimEnd());
            break;
        case "error":
            console.log(item.get("data")?.trimEnd());
            break;
        case "stat":
            console.log(item);
            break;
        default:
            console.log(item);
            break;
        }
    }
}

async function runWithoutParse(args: string[]) {
    child.spawn("p4", args, { stdio: "inherit" });
}

async function runEditor(args: string[]) {
    args.shift();
    const tty = await open("/dev/tty", "w+");
    child.spawnSync("vim", args, { stdio: [tty.createReadStream(), tty.createWriteStream()] });
}

async function main() {
    const args = process.argv.slice(2);
    if (args[0] && args[0].substring(0, 1) === "-") {
        if (args[0] == "-E") {
            return await runEditor(args);
        }
        return await runWithoutParse(args);
    }
    return await runWithParse(args);
}

main();
