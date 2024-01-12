import Handler from "./base";
import { parse, FileStatusSpec } from "./p4object";
import ChangeHandler, { type ChangeConfig } from "./_change";

import { run } from "../run";
import { ActionsMapping } from "./consts";
import { logError, logInfo } from "../logger";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";

interface FileStatus extends P4Object<typeof FileStatusSpec> {
    messages: string[];
}

export interface Change {
    name: string,
    description?: string,
    files: FileStatus[],
}

export default class StatusHandler extends Handler<Record<string, Change>> {

    currentFile: FileStatus | null = null;
    changes: Record<string, Change> = {};
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    descriptionPromises: Promise<ChangeConfig | null>[] = [];

    stat(stat: StatMessage) {
        const file: FileStatus = { ...parse(FileStatusSpec, stat.data), messages: [] };
        const change = file.change || "";
        if (this.changes[change] === undefined) {
            this.changes[change] = { name: change, files: [] };
            if (change != "default" && change != "") {
                const handler = new ChangeHandler();
                this.descriptionPromises.push(run("change", ["-o", change], handler));
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
        if (this.option.root) {
            for (const [name, change] of Object.entries(this.changes)) {
                if (name == "") {
                    logInfo("Untracked files:");
                    logInfo("  (use p4 add/edit/delete/reconcile to track them)");
                } else if (name == "default") {
                    logInfo("Changelist default:");
                    logInfo("  (use p4 shelve to create a new changelist and push them to server)");
                    logInfo("  (use p4 reopen to move them to a numbered changelist)");
                } else if (change) {
                    logInfo(`Changelist #${change.name}: ${change.description}`);
                    logInfo("  (use p4 shelve to push them to server)");
                }
                for (const file of change.files) {
                    const color = ActionsMapping.color[file.action];
                    logInfo(color(`\t[${ActionsMapping.short[file.action]}] ${file.depotFile}`));
                }
                logInfo();
            }
            for (const message of this.messages) {
                logInfo(message.data.trim());
            }
            for (const error of this.errors) {
                logError(error.data.trim());
            }
        }
        return this.changes;
    }

}
