import Handler, { ErrorMessage, InfoMessage, StatMessage } from "./base";
import { parse, P4Object, ChangeConfigSpec, FileStatusSpec } from "./p4object";
import ChangeHandler from "./_change";

import { run } from "../run";
import { actionConvert } from "../convert";

interface FileStatus extends P4Object<typeof FileStatusSpec> {
    messages: string[];
}

interface Change {
    name: string,
    description?: string,
    files: FileStatus[],
}

export default class StatusHandler extends Handler {

    currentFile: FileStatus | null = null;
    changes: { [key: string]: Change } = {};
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    descriptionPromises: Promise<P4Object<typeof ChangeConfigSpec> | null>[] = [];

    stat(stat: StatMessage) {
        const file: FileStatus = { ...parse(FileStatusSpec, stat.data), messages: [] };
        const change = file.change || "";
        if (this.changes[change] === undefined) {
            this.changes[change] = { name: change, files: [] };
            if (change != "default" && change != "") {
                const handler = new ChangeHandler();
                this.descriptionPromises.push(run("change", handler, ["-o", change]) as Promise<P4Object<typeof ChangeConfigSpec> | null>);
            }
        }
        this.changes[change].files.push(file);
        this.currentFile = file;
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
            const changesDetail = await Promise.all(this.descriptionPromises);
            for (const detail of changesDetail) {
                if (!detail) {
                    throw new Error("p4 change returned nothing");
                }
                const change = this.changes[detail.Change];
                if (change === undefined) {
                    throw new Error("p4 change returned non-exist changelist");
                }
                change.description = detail.Description.trim();
            }
            for (const [name, change] of Object.entries(this.changes)) {
                if (name == "") {
                    console.log("Untracked files:");
                    console.log("  (use p4 add/edit/delete/reconcile to track them)");
                } else if (name == "default") {
                    console.log("Changelist default:");
                    console.log("  (use p4 shelve to create a new changelist and push them to server)");
                    console.log("  (use p4 reopen to move them to a numbered changelist)");
                } else if (change) {
                    console.log(`Changelist #${change.name}: ${change.description}`);
                    console.log("  (use p4 shelve to push them to server)");
                }
                for (const file of change.files) {
                    const color = actionConvert.color[file.action];
                    console.log(color(`\t[${actionConvert.short[file.action]}] ${file.depotFile}`));
                }
                console.log();
            }
            for (const message of this.messages) {
                console.log(message.data.trim());
            }
            for (const error of this.errors) {
                console.error(error.data.trim());
            }
        }
        return this.changes;
    }

}
