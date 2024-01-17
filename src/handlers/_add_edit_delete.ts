import Handler from "./base";
import { ActionsMapping } from "./consts";
import { parse, FileActionSpec } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";

export interface FileAction extends P4Object<typeof FileActionSpec> {
    messages: string[];
}

export default class AddEditDeleteHandler extends Handler<FileAction[]> {

    currentAction: FileAction | null = null;
    actions: FileAction[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    override stat(stat: StatMessage) {
        const action: FileAction = { ...parse(FileActionSpec, stat.data), messages: [] };
        this.actions.push(action);
        this.currentAction = action;
    }

    override info(info: InfoMessage) {
        const lastDash = info.data.lastIndexOf(" - ");
        const fileName = info.data.substring(0, lastDash);
        if (fileName == this.currentAction?.depotFile) {
            const infoText = info.data.substring(lastDash + 3).trim();
            this.currentAction.messages.push(infoText);
        } else {
            this.messages.push(info);
        }
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    async finalize() {
        if (this.option.root) {
            for (const action of this.actions) {
                const color = ActionsMapping.color[action.action];
                this.ctx.printText(color(`[${ActionsMapping.short[action.action]}] ${action.depotFile}`));
                for (const message of action.messages) {
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
        return this.actions;
    }

}
