import { Writable } from "stream";

import Buffers from "../buffers";

export interface HandlerOption {
    root?: boolean;
    args?: string[];
}

export interface HandlerFlags {
    pager?: boolean;
}

export interface StatMessage {
    data: Map<string, unknown>,
}

export interface InfoMessage {
    level: number,
    data: string,
}

export interface ErrorMessage {
    data: string,
    severity: number,
    generic: number,
}

export interface TextMessage {
    data: string,
}

export default abstract class Handler<T> {

    option: HandlerOption;
    stream: Writable = process.stdout;

    constructor(option: HandlerOption = {}) {
        this.option = option;
    }

    flags(): HandlerFlags { return {}; }

    stat(stat: StatMessage): void { stat; }
    info(info: InfoMessage): void { info; }
    error(error: ErrorMessage): void { error; }
    text(text: TextMessage): void { text; }

    take(buffers: Buffers): void { buffers; }

    abstract finalize(): Promise<T>;

    feed(obj: Map<string, unknown>): void {
        const code = obj.get("code");
        obj.delete("code");
        switch (code) {
        case "stat":
            return this.stat({ data: obj });
        case "info":
            return this.info(Object.fromEntries(obj) as unknown as InfoMessage);
        case "error":
            return this.error(Object.fromEntries(obj) as unknown as ErrorMessage);
        case "text":
            return this.text(Object.fromEntries(obj) as unknown as TextMessage);
        default:
            throw new Error(`unrecognized code: ${code}`);
        }
    }

    print(s: string = "", newline: boolean = true) {
        this.stream.write(s);
        if (newline) {
            this.stream.write("\n");
        }
    }

}
