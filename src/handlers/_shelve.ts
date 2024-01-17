import Handler from "./base";
import { Texts, ActionsMapping } from "./consts";
import { parse, ShelvedFileSpec } from "./p4object";
import ChangeHandler from "./_change";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";
import type { ChangeConfig } from "./_change";

// TODO: Fix duplicated code with ChangeHandler

type ShelvedFile = P4Object<typeof ShelvedFileSpec>;

export interface Shelve {
    name: string
    description?: string
    files: ShelvedFile[]
}

export default class ShelveHandler extends Handler<Shelve | null> {
    shelve: Shelve | null = null;
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    descriptionPromise: Promise<ChangeConfig | null> | null = null;

    override stat(stat: StatMessage) {
        const sf = parse(ShelvedFileSpec, stat.data);
        if (sf.change) {
            if (this.shelve?.name && this.shelve.name !== sf.change) {
                throw new Error(`change number is not consistent: ${this.shelve.name} and ${sf.change}`);
            }
            if (this.shelve === null) {
                this.shelve = { name: sf.change, files: [] };
                const handler = new ChangeHandler(this.ctx);
                if (this.ctx.runP4) {
                    this.descriptionPromise = this.ctx.runP4("change", ["-o", this.shelve.name], handler);
                }
            }
        }
        if (this.shelve === null) {
            throw new Error("unknown shelve number");
        }
        this.shelve.files.push(sf);
    }

    override info(info: InfoMessage) {
        this.messages.push(info);
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    override consume() {
        const lastErrorMessage = this.errors.length > 0 ? this.errors[this.errors.length - 1].data : null;
        if (lastErrorMessage?.startsWith(Texts.errorInChange)) {
            const peeked = this.buffers!.peek(Texts.hitReturnToContinue.length);
            if (peeked == null) {
                return { action: "request" as const, must: true };
            }
            if (peeked.toString() != Texts.hitReturnToContinue) {
                throw new Error("failed to parse continue text");
            }
            this.buffers!.consume(peeked.length);
            this.errors.pop();
            // Print out the error data and pop it out
            this.ctx.printText(lastErrorMessage, false);
            // Print it out to user
            this.ctx.printText(Texts.hitReturnToContinue, false);
        }
        return { action: "response" as const, value: null, yield: true };
    }

    async finalize() {
        if (this.shelve) {
            this.shelve.description = (await this.descriptionPromise)?.Description.trim();
        }
        if (this.option.root) {
            if (this.shelve) {
                this.ctx.printText(`Shelved changelist #${this.shelve.name}: ${this.shelve.description}`);
                for (const file of this.shelve.files) {
                    const color = ActionsMapping.color[file.action];
                    this.ctx.printText(color(`\t[${ActionsMapping.short[file.action]}] ${file.depotFile}`));
                }
            }
            for (const message of this.messages) {
                this.ctx.printText(message.data.trim());
            }
            for (const error of this.errors) {
                this.ctx.printError(error.data.trim());
            }
        }
        return this.shelve;
    }
}
