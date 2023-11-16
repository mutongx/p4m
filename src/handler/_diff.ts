import Handler from "./base";
import { ErrorMessage, InfoMessage, StatMessage, TextMessage } from "../types";

export default class DiffHandler extends Handler {

    constructor() {
        super();
    }

    stat(stat: StatMessage) {
        console.log(stat);
    }

    info(info: InfoMessage) {
        console.log(info);
    }

    error(error: ErrorMessage) {
        console.log(error);
    }

    text(text: TextMessage) {
        console.log(text);
    }

    async finalize() {

    }

}
