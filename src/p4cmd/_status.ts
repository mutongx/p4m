import Command from "./base";
import { ErrorMessage, FileStatusMessage, InfoMessage, StatMessage } from "../types";

export default class StatusCommand extends Command {

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

    finalize() {

    }

}
