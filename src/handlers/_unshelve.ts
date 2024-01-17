import Handler from "./base";
import { ActionsMapping } from "./consts";
import { parse, ShelvedFileSpec } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";

// TODO: Fix duplicated code with AddEditDeleteHandler

export interface UnshelvedFile extends P4Object<typeof ShelvedFileSpec> {
    messages: string[],
}

export default class UnshelveHandler extends Handler<UnshelvedFile[]> {

    currentFile: UnshelvedFile | null = null;
    files: UnshelvedFile[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    override stat(stat: StatMessage) {
        const uf: UnshelvedFile = { ...parse(ShelvedFileSpec, stat.data), messages: [] };
        this.files.push(uf);
        this.currentFile = uf;
    }

    override info(info: InfoMessage) {
        const lastDash = info.data.lastIndexOf(" - ");
        const fileName = info.data.substring(0, lastDash);
        if (fileName == this.currentFile?.depotFile) {
            const infoText = info.data.substring(lastDash + 3).trim();
            this.currentFile.messages.push(infoText);
        } else {
            this.messages.push(info);
        }
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    async finalize() {
        if (this.option.root) {
            for (const file of this.files) {
                const color = ActionsMapping.color[file.action];
                this.ctx.printText(color(`[${ActionsMapping.short[file.action]}] ${file.depotFile}`));
                for (const message of file.messages) {
                    this.ctx.printText(`  - ${message}`);
                }
            }
            for (const message of this.messages) {
                this.ctx.printText(message.data.trim());
            }
            for (const error of this.errors) {
                this.ctx.printError(error.data.trim());
            }
        }
        return this.files;
    }

}
