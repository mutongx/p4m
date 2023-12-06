import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, ShelvedFileSpec } from "./p4object";

import ChangeHandler, { ChangeConfig } from "./_change";

import Buffers from "../buffers";
import { run } from "../run";
import { Texts, ActionTextsMapping } from "../consts";

// TODO: Fix duplicated code with ChangeHandler

type ShelvedFile = P4Object<typeof ShelvedFileSpec>;

export interface Shelve {
    name: string,
    description?: string,
    files: ShelvedFile[],
}

export default class ShelveHandler extends Handler<Shelve | null> {

    shelve: Shelve | null = null;
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    descriptionPromise: Promise<ChangeConfig | null> | null = null;

    stat(stat: StatMessage) {
        const sf = parse(ShelvedFileSpec, stat.data);
        if (sf.change) {
            if (this.shelve?.name && this.shelve.name !== sf.change) {
                throw new Error(`change number is not consistent: ${this.shelve.name} and ${sf.change}`);
            }
            if (this.shelve === null) {
                this.shelve = { name: sf.change, files: [] };
                const handler = new ChangeHandler();
                this.descriptionPromise = run("change", ["-o", this.shelve.name], handler);
            }
        }
        if (this.shelve === null) {
            throw new Error("unknown shelve number");
        }
        this.shelve.files.push(sf);
    }

    info(info: InfoMessage) {
        this.messages.push(info);
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    take(buffers: Buffers) {
        const error = this.errors[this.errors.length - 1];
        if (this.option.root && error) {
            if (error.data.startsWith(Texts.errorInChange)) {
                // Print out the error data and pop it out
                console.log(error.data.trim());
                this.errors.pop();
                // Consume the continuation prompt, don't give it to MarshalParser
                const continueBuffer = buffers.consume(Texts.hitReturnToContinue.length);
                if (!continueBuffer || continueBuffer.toString() !== Texts.hitReturnToContinue) {
                    throw new Error("failed to parse continue text");
                }
                // Print it out to user
                process.stdout.write(Texts.hitReturnToContinue);
            }
        }
    }

    async finalize() {
        if (this.shelve) {
            this.shelve.description = (await this.descriptionPromise)?.Description.trim();
        }
        if (this.option.root) {
            if (this.shelve) {
                console.log(`Shelved changelist #${this.shelve.name}: ${this.shelve.description}`);
                for (const file of this.shelve.files) {
                    const color = ActionTextsMapping.color[file.action];
                    console.log(color(`\t[${ActionTextsMapping.short[file.action]}] ${file.depotFile}`));
                }
            }
            for (const message of this.messages) {
                console.log(message.data.trim());
            }
            for (const error of this.errors) {
                console.error(error.data.trim());
            }
        }
        return this.shelve;
    }

}
