import Buffers from "../buffers";
import { ErrorMessage, InfoMessage, StatMessage, TextMessage } from "./types";

export interface HandlerOption {
    root?: boolean;
}

export default abstract class Handler {

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
        switch (code) {
        case "stat":
            this.stat(Object.fromEntries(obj) as unknown as StatMessage);
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

    async finalize(): Promise<unknown> { return null; }

}
