import Handler from "./base";
import { ChangeSpecificationMessage, ErrorMessage, InfoMessage, StatMessage } from "./types";

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

    async finalize() {
        if (this.option.root && this.change) {
            // TODO: Output as Perforce's text format
            console.log(JSON.stringify(this.change, undefined, 2));
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
