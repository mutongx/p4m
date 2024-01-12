import Handler from "./base";
import { Texts } from "./consts";
import { parse, ChangeConfigSpec } from "./p4object";

import Buffers from "../common/buffers";

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

    take(buffers: Buffers) {
        const lastErrorMessage = this.errors.length > 0 ? this.errors[this.errors.length - 1].data : null;
        if (this.option.root && lastErrorMessage?.startsWith(Texts.errorInChange)) {
            this.errors.pop();
            // Print out the error data and pop it out
            this.ctx.printText(lastErrorMessage, false);
            // Consume the continuation prompt, don't give it to MarshalParser
            const continueBuffer = buffers.consume(Texts.hitReturnToContinue.length);
            if (!continueBuffer || continueBuffer.toString() !== Texts.hitReturnToContinue) {
                throw new Error("failed to parse continue text");
            }
            // Print it out to user
            this.ctx.printText(Texts.hitReturnToContinue, false);
        }
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
