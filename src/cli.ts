import process from "process";
import child from "child_process";
import { MarshalParser } from "./marshal";

async function main() {
    const args = process.argv.slice(2);
    if (args[0] != "-G") {
        args.unshift("-G");
    }
    const proc = child.spawn("p4", args, { stdio: ["pipe", "pipe", 2] });
    const m = new MarshalParser(proc.stdout!);
    for await (const item of m.consume()) {
        console.log(item);
    }
}

main();
