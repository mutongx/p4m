import Handler from "./base";
import { parse, DiffItemSpec } from "./p4object";

import { DiffType, colorDiff } from "../common/diff";
import { LineIterator } from "../common/iter";

import type { ErrorMessage, InfoMessage, StatMessage, TextMessage, HandlerOption } from "./base";
import type { P4Object } from "./p4object";

import type Context from "../common/context";

export interface Diff extends P4Object<typeof DiffItemSpec> {
    data: string | null
}

export default class DiffHandler extends Handler<Diff[]> {
    diffType: DiffType = DiffType.Normal;
    currentDiff: Diff | null = null;
    diffs: Diff[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    constructor(ctx: Context, option: HandlerOption = {}) {
        super(ctx, option);

        for (const arg of this.option.args || []) {
            if (arg.startsWith("-d")) {
                for (let i = 2; i < arg.length; ++i) {
                    const ch = arg[i];
                    if (ch == "b" || ch == "w" || ch == "l" || ("0" <= ch && ch <= "9")) {
                        continue;
                    } else if (ch == "u") {
                        this.diffType = DiffType.Unified;
                    } else if (ch == "c") {
                        this.diffType = DiffType.Context;
                    } else {
                        this.diffType = DiffType.Unknown;
                    }
                }
            }
        }
    }

    override stat(stat: StatMessage) {
        const d = { ...parse(DiffItemSpec, stat.data), data: "" };
        this.currentDiff = d;
        this.diffs.push(d);
    }

    override info(info: InfoMessage) {
        this.messages.push(info);
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    override text(text: TextMessage) {
        this.currentDiff!.data += text.data;
    }

    async finalize() {
        if (this.option.root) {
            if (this.diffs.length > 0) {
                const pager = this.ctx.newPager ? this.ctx.newPager() : null;
                const printer: (s: string) => void = pager ? pager.write : this.ctx.printText;
                for (const d of this.diffs) {
                    printer(`===== ${d.depotFile}#${d.rev} - ${d.clientFile} =====\n`);
                    printer("\n");
                    for (const line of new LineIterator(d.data).iter(true)) {
                        printer(colorDiff(line, this.diffType));
                        printer("\n");
                    }
                    printer("\n");
                }
                if (pager) {
                    pager.end();
                    await pager.wait();
                }
            }
            // normal messages and errors does not use pager
            for (const message of this.messages) {
                this.ctx.printText(message.data.trim());
            }
            for (const error of this.errors) {
                this.ctx.printError(error.data.trim());
            }
        }
        return this.diffs;
    }
}
