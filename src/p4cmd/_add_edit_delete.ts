import Command from "./base";
import { ErrorMessage, FileActionMessage, InfoMessage, StatMessage } from "../types";
import { actionConvert } from "../convert";

export default class AddEditDeleteCommand extends Command {

    currentFile: string | null = null;

    constructor() {
        super();
    }

    stat(stat: StatMessage) {
        const fa = stat as FileActionMessage;
        this.currentFile = fa.depotFile;
        console.log(`[${actionConvert.short[fa.action]}] ${fa.depotFile}`);
    }

    info(info: InfoMessage) {
        const lastDash = info.data.lastIndexOf(" - ");
        const fileName = info.data.substring(0, lastDash);
        if (fileName == this.currentFile) {
            const infoMessage = info.data.substring(lastDash + 3).trim();
            console.log(`   ! ${infoMessage}`);
        } else {
            console.log(`${info.data.trim()}`);
        }
    }

    error(error: ErrorMessage) {
        console.log(`${error.data.trim()}`);
    }

    async finalize() {

    }

}
