import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, ChangeConfigSpec } from "./p4object";

import Buffers from "../buffers";
import { Texts } from "../consts";

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
        const error = this.errors[this.errors.length - 1];
        if (this.option.root && error) {
            if (error.data.startsWith(Texts.errorInChange)) {
                // Print out the error data and pop it out
                this.print(error.data.trim());
                this.errors.pop();
                // Consume the continuation prompt, don't give it to MarshalParser
                const continueBuffer = buffers.consume(Texts.hitReturnToContinue.length);
                if (!continueBuffer || continueBuffer.toString() !== Texts.hitReturnToContinue) {
                    throw new Error("failed to parse continue text");
                }
                // Print it out to user
                this.print(Texts.hitReturnToContinue, false);
            }
        }
    }

    async finalize() {
        if (this.option.root) {
            if (this.change) {
                // TODO: Output as Perforce's text format
                this.print(JSON.stringify(this.change, undefined, 2));
            }
            for (const message of this.messages) {
                this.print(message.data.trim());
            }
            for (const error of this.errors) {
                this.print(error.data.trim());
            }
        }
        return this.change;
    }

}
