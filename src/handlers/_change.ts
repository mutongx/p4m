import Handler from "./base";
import { ChangeSpecificationMessage, ErrorMessage, InfoMessage, StatMessage } from "./types";

export default class ChangeHandler extends Handler {

    change: ChangeSpecificationMessage | null = null;

    stat(stat: StatMessage) {
        this.change = stat as ChangeSpecificationMessage;
    }

    info(info: InfoMessage) {
        console.log(info.data.trim());
    }

    error(error: ErrorMessage) {
        console.log(`Error: ${error.data.trim()}`);
    }

    async finalize() {
        if (this.option.root && this.change) {
            // TODO: Output as Perforce's text format
            console.log(JSON.stringify(this.change, undefined, 2));
        }
        return this.change;
    }

}
