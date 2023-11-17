import Buffers from "../buffers";
import Handler from "./base";
import { ChangeSpecificationMessage, ErrorMessage, InfoMessage, StatMessage } from "./types";

const errorText = "Error in change specification.";
const continueText = "Hit return to continue...";

export default class ChangeHandler extends Handler {

    change: ChangeSpecificationMessage | null = null;
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        this.change = stat as ChangeSpecificationMessage;
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
            if (error.data.startsWith(errorText)) {
                // Print out the error data and pop it out
                console.log(error.data.trim());
                this.errors.pop();
                // Consume the continuation prompt, don't give it to MarshalParser
                const continueBuffer = buffers.consume(continueText.length);
                if (!continueBuffer || continueBuffer.toString() !== continueText) {
                    throw new Error("failed to parse continue text");
                }
                // Print it out to user
                console.log(continueText);
            }
        }
    }

    async finalize() {
        if (this.option.root) {
            if (this.change) {
                // TODO: Output as Perforce's text format
                console.log(JSON.stringify(this.change, undefined, 2));
            }
            for (const message of this.messages) {
                console.log(message.data.trim());
            }
            for (const error of this.errors) {
                console.error(error.data.trim());
            }
        }
        return this.change;
    }

}
