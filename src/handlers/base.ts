import { BuffersConsumer } from "../common/buffers";

import type Context from "../common/context";

export interface HandlerOption {
    root?: boolean
    args?: string[]
}

export interface StatMessage {
    data: Map<string, unknown>
}

export interface InfoMessage {
    level: number
    data: string
}

export interface ErrorMessage {
    data: string
    severity: number
    generic: number
}

export interface TextMessage {
    data: string
}

export default abstract class Handler<T> extends BuffersConsumer {
    ctx: Context;
    option: HandlerOption;

    constructor(ctx: Context, option: HandlerOption = {}) {
        super();
        this.ctx = ctx;
        this.option = option;
    }

    stat(stat: StatMessage): void { stat; }
    info(info: InfoMessage): void { info; }
    error(error: ErrorMessage): void { error; }
    text(text: TextMessage): void { text; }

    abstract finalize(): Promise<T> | T;

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
                throw new Error(`unrecognized code: ${code as string}`);
        }
    }
}
