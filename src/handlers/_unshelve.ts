import Handler from "./base";
import { ErrorMessage, InfoMessage, StatMessage } from "./types";
import { P4Object, ShelvedFileSpec } from "./types";
import { actionConvert } from "../convert";

// TODO: Fix duplicated code with AddEditDeleteHandler

interface UnshelvedFile extends P4Object<typeof ShelvedFileSpec> {
    messages: string[],
}

export default class UnshelveHandler extends Handler {

    currentFile: UnshelvedFile | null = null;
    files: UnshelvedFile[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        const uf: UnshelvedFile = { ...stat as unknown as P4Object<typeof ShelvedFileSpec>, messages: [] };
        this.files.push(uf);
        this.currentFile = uf;
    }

    info(info: InfoMessage) {
        const lastDash = info.data.lastIndexOf(" - ");
        const fileName = info.data.substring(0, lastDash);
        if (fileName == this.currentFile?.depotFile) {
            const infoText = info.data.substring(lastDash + 3).trim();
            this.currentFile.messages.push(infoText);
        } else {
            this.messages.push(info);
        }
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    async finalize() {
        if (this.option.root) {
            for (const file of this.files) {
                const color = actionConvert.color[file.action];
                console.log(color(`[${actionConvert.short[file.action]}] ${file.depotFile}`));
                for (const message of file.messages) {
                    console.log(`  - ${message}`);
                }
            }
            for (const message of this.messages) {
                console.log(message.data.trim());
            }
            for (const error of this.errors) {
                console.log(error.data.trim());
            }
        }
        return this.files;
    }

}
