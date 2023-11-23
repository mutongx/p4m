import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, ChangeConfigSpec, ShelvedFileSpec } from "./p4object";
import ChangeHandler from "./_change";

import Buffers from "../buffers";
import { run } from "../run";
import { actionConvert } from "../convert";

// TODO: Fix duplicated code with ChangeHandler

const errorText = "Error in change specification.";
const continueText = "Hit return to continue...";

interface Shelve {
    name: string,
    description?: string,
    files: P4Object<typeof ShelvedFileSpec>[],
}

export default class ShelveHandler extends Handler {

    shelve: Shelve | null = null;
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    descriptionPromise: Promise<P4Object<typeof ChangeConfigSpec> | null> | null = null;

    stat(stat: StatMessage) {
        const sf = parse(ShelvedFileSpec, stat.data);
        if (sf.change) {
            if (this.shelve?.name && this.shelve.name !== sf.change) {
                throw new Error(`change number is not consistent: ${this.shelve.name} and ${sf.change}`);
            }
            if (this.shelve === null) {
                this.shelve = { name: sf.change, files: [] };
                const handler = new ChangeHandler();
                this.descriptionPromise = run("change", handler, ["-o", this.shelve.name]) as Promise<P4Object<typeof ChangeConfigSpec> | null>;
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
            if (error.data.startsWith(errorText)) {
                // Print out the error data and pop it out
                console.log(error.data.trim());
                this.errors.pop();
                // Consume the continuation prompt, don't give it to MarshalParser
                const continueBuffer = buffers.consume(continueText.length);
                if (!continueBuffer || continueBuffer.toString() !== continueText) {
                    throw new Error("failed to parse continue text");
                }
                // Print it out to user
                process.stdout.write(continueText);
            }
        }
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
        return this.shelve;
    }

}
