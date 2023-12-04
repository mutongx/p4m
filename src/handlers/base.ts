import Buffers from "../buffers";

export interface HandlerOption {
    root?: boolean;
    args?: string[];
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

    constructor(option: HandlerOption = {}) {
        this.option = option;
    }

    stat(stat: StatMessage) { stat; }
    info(info: InfoMessage) { info; }
    error(error: ErrorMessage) { error; }
    text(text: TextMessage) { text; }

    feed(obj: Map<string, unknown>) {
        const code = obj.get("code");
        obj.delete("code");
        switch (code) {
        case "stat":
            this.stat({ data: obj });
            break;
        case "info":
            this.info(Object.fromEntries(obj) as unknown as InfoMessage);
            break;
        case "error":
            this.error(Object.fromEntries(obj) as unknown as ErrorMessage);
            break;
        case "text":
            this.text(Object.fromEntries(obj) as unknown as TextMessage);
            break;
        default:
            throw new Error(`unrecognized code: ${code}`);
        }
    }

    take(buffers: Buffers) { buffers; }

    abstract finalize(): Promise<T>;

}
