import Handler from "./base";
import { ErrorMessage, FileInfoDumpMessage, InfoMessage, StatMessage } from "./types";

export default class FstatHandler extends Handler {

    stat(stat: StatMessage) {
        const fs = stat as FileInfoDumpMessage;
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
