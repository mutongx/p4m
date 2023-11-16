import Handler from "./base";
import { ErrorMessage, FileActionMessage, InfoMessage, StatMessage } from "./types";
import { actionConvert } from "../convert";

interface FileAction extends FileActionMessage {
    messages: string[];
}

export default class AddEditDeleteHandler extends Handler {

    currentAction: FileAction | null = null;
    actions: FileAction[] = [];
    messages: InfoMessage[] = [];

    stat(stat: StatMessage) {
        const action: FileAction = { ...stat as FileActionMessage, messages: [] };
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
        console.log(`Error: ${error.data.trim()}`);
    }

    async finalize() {
        if (this.option.root) {
            for (const action of this.actions) {
                const color = actionConvert.color[action.action];
                console.log(color(`[${actionConvert.short[action.action]}] ${action.depotFile}`));
                for (const message of action.messages) {
                    console.log(`  - ${message}`);
                }
            }
            for (const message of this.messages) {
                console.log(message.data.trim());
            }
        }
        return this.actions;
    }

}
