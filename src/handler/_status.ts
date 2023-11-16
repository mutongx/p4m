import Handler from "./base";
import { ErrorMessage, FileStatusMessage, InfoMessage, StatMessage } from "../types";

export default class StatusHandler extends Handler {

    constructor() {
        super();
    }

    stat(stat: StatMessage) {
        const fs = stat as FileStatusMessage;
        console.log(fs);
    }

    info(info: InfoMessage) {
        console.log(info);
    }

    error(error: ErrorMessage) {
        console.log(error);
    }

    async finalize() {

    }

}
