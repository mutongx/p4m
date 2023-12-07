import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, ShelvedFileSpec } from "./p4object";

import { ActionTextsMapping } from "../consts";
import { logError, logInfo } from "../logger";

// TODO: Fix duplicated code with AddEditDeleteHandler

export interface UnshelvedFile extends P4Object<typeof ShelvedFileSpec> {
    messages: string[],
}

export default class UnshelveHandler extends Handler<UnshelvedFile[]> {

    currentFile: UnshelvedFile | null = null;
    files: UnshelvedFile[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        const uf: UnshelvedFile = { ...parse(ShelvedFileSpec, stat.data), messages: [] };
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
                const color = ActionTextsMapping.color[file.action];
                logInfo(color(`[${ActionTextsMapping.short[file.action]}] ${file.depotFile}`));
                for (const message of file.messages) {
                    logInfo(`  - ${message}`);
                }
            }
            for (const message of this.messages) {
                logInfo(message.data.trim());
            }
            for (const error of this.errors) {
                logError(error.data.trim());
            }
        }
        return this.files;
    }

}
