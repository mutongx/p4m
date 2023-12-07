import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, FileActionSpec } from "./p4object";

import { ActionTextsMapping } from "../consts";
import { logError, logInfo } from "../logger";

export interface FileAction extends P4Object<typeof FileActionSpec> {
    messages: string[];
}

export default class AddEditDeleteHandler extends Handler<FileAction[]> {

    currentAction: FileAction | null = null;
    actions: FileAction[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        const action: FileAction = { ...parse(FileActionSpec, stat.data), messages: [] };
        this.actions.push(action);
        this.currentAction = action;
    }

    info(info: InfoMessage) {
        const lastDash = info.data.lastIndexOf(" - ");
        const fileName = info.data.substring(0, lastDash);
        if (fileName == this.currentAction?.depotFile) {
            const infoText = info.data.substring(lastDash + 3).trim();
            this.currentAction.messages.push(infoText);
        } else {
            this.messages.push(info);
        }
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    async finalize() {
        if (this.option.root) {
            for (const action of this.actions) {
                const color = ActionTextsMapping.color[action.action];
                logInfo(color(`[${ActionTextsMapping.short[action.action]}] ${action.depotFile}`));
                for (const message of action.messages) {
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
        return this.actions;
    }

}
