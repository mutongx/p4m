import Handler, { ErrorMessage, InfoMessage, StatMessage, TextMessage } from "./base";
import { parse, P4Object, DiffItemSpec } from "./p4object";

export interface Diff extends P4Object<typeof DiffItemSpec> {
    data: string | null,
}

export default class DiffHandler extends Handler<Diff[]> {

    currentDiff: Diff | null = null;
    diffs: Diff[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    stat(stat: StatMessage) {
        const d = { ...parse(DiffItemSpec, stat.data), data: null };
        this.currentDiff = d;
        this.diffs.push(d);
    }

    info(info: InfoMessage) {
        this.messages.push(info);
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    text(text: TextMessage) {
        this.currentDiff!.data = text.data;
    }

    async finalize() {
        if (this.option.root) {
            for (const d of this.diffs) {
                console.log(`===== ${d.depotFile}#${d.rev} - ${d.clientFile} =====`);
                console.log();
                console.log(d.data);
            }
        }
        return this.diffs;
    }

}
