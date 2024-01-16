import Handler from "./base";
import { Texts } from "./consts";
import { parse, ChangeConfigSpec } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";

export type ChangeConfig = P4Object<typeof ChangeConfigSpec>;

export default class ChangeHandler extends Handler<ChangeConfig | null> {

    change: ChangeConfig | null = null;
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        this.change = parse(ChangeConfigSpec, stat.data);
    }

    info(info: InfoMessage) {
        this.messages.push(info);
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    run() {
        const lastErrorMessage = this.errors.length > 0 ? this.errors[this.errors.length - 1].data : null;
        if (lastErrorMessage?.startsWith(Texts.errorInChange)) {
            const peeked = this.buffers!.peek(Texts.hitReturnToContinue.length);
            if (peeked == null) {
                return { action: "request" as const, must: true };
            }
            if (peeked.toString() != Texts.hitReturnToContinue) {
                throw new Error("failed to parse continue text");
            }
            this.buffers!.consume(peeked.length);
            this.errors.pop();
            // Print out the error data and pop it out
            this.ctx.printText(lastErrorMessage, false);
            // Print it out to user
            this.ctx.printText(Texts.hitReturnToContinue, false);
        }
        return { action: "response" as const, value: null, yield: true };
    }

    async finalize() {
        if (this.option.root) {
            if (this.change) {
                // TODO: Output as Perforce's text format
                this.ctx.printText(JSON.stringify(this.change, undefined, 2));
            }
            for (const message of this.messages) {
                this.ctx.printText(message.data.trim());
            }
            for (const error of this.errors) {
                this.ctx.printError(error.data.trim());
            }
        }
        return this.change;
    }

}
