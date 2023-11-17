import { run } from "../run";
import ChangeHandler from "./_change";
import { ChangeSpecificationMessage, ShelvedFileMessage, StatMessage } from "./types";
import { actionConvert } from "../convert";

interface ShelvedFile {
    depotFile: string,
    rev: string,
    action: string,
}

interface Shelve {
    name: string,
    description?: string,
    files: ShelvedFile[],
}

export default class ShelveHandler extends ChangeHandler {

    shelve: Shelve | null = null;

    descriptionPromise: Promise<ChangeSpecificationMessage | null> | null = null;

    stat(stat: StatMessage) {
        const sf = stat as ShelvedFileMessage;
        if (sf.change) {
            if (this.shelve?.name && this.shelve.name !== sf.change) {
                throw new Error(`change number is not consistent: ${this.shelve.name} and ${sf.change}`);
            }
            if (this.shelve === null) {
                this.shelve = {name: sf.change, files: []};
                const handler = new ChangeHandler();
                this.descriptionPromise = run("change", handler, ["-o", this.shelve.name]) as Promise<ChangeSpecificationMessage | null>;
            }
        }
        if (this.shelve === null) {
            throw new Error("unknown shelve number");
        }
        this.shelve.files.push(sf);
    }

    
    async finalize() {
        if (this.option.root) {
            if (this.shelve) {
                this.shelve.description = (await this.descriptionPromise)?.Description.trim();
                console.log(`Shelved changelist #${this.shelve.name}: ${this.shelve.description}`);
                for (const file of this.shelve.files) {
                    const color = actionConvert.color[file.action];
                    console.log(color(`\t[${actionConvert.short[file.action]}] ${file.depotFile}`));
                }
            }
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