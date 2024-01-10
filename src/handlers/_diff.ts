import { DiffColorMapping } from "../consts";
import { logError, logInfo } from "../logger";
import { runPager } from "../run";
import Handler from "./base";
import { parse, DiffItemSpec } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage, TextMessage, HandlerOption } from "./base";
import type { P4Object } from "./p4object";

export interface Diff extends P4Object<typeof DiffItemSpec> {
    data: string | null,
}

enum DiffType {
    Normal,
    Unknown,
    Unified,
    Context,
}

export default class DiffHandler extends Handler<Diff[]> {

    diffType: DiffType = DiffType.Normal;
    currentDiff: Diff | null = null;
    diffs: Diff[] = [];
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    constructor(option: HandlerOption = {}) {
        super(option);

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

    flags() {
        if (this.option.root) {
            return { pager: true };
        }
        return {};
    }

    stat(stat: StatMessage) {
        const d = { ...parse(DiffItemSpec, stat.data), data: "" };
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
        this.currentDiff!.data += text.data;
    }

    *iterateLine(s: string) {
        let pos = 0;
        while (true) {
            const next = s.indexOf("\n", pos);
            if (next == -1) {
                const last = s.substring(pos);
                if (last.length != 0) {
                    yield last;
                }
                break;
            }
            yield s.substring(pos, next);
            pos = next + 1;
        }
    }

    getColor(s: string) {
        if (this.diffType == DiffType.Normal) {
            if (s.startsWith("<")) {
                return DiffColorMapping.deleted;
            }
            if (s.startsWith(">")) {
                return DiffColorMapping.added;
            }
            if (s !== "---") {
                return DiffColorMapping.context;
            }
            return DiffColorMapping.default;
        }
        if (this.diffType == DiffType.Unified) {
            if (s.startsWith("@@ ")) {
                return DiffColorMapping.context;
            }
            if (s.startsWith("-")) {
                return DiffColorMapping.deleted;
            }
            if (s.startsWith("+")) {
                return DiffColorMapping.added;
            }
            return DiffColorMapping.default;
        }
        if (this.diffType == DiffType.Context) {
            if (s.startsWith("*** ") || s.startsWith("--- ") || s === "***************") {
                return DiffColorMapping.context;
            }
            if (s.startsWith("!")) {
                return DiffColorMapping.modified;
            }
            if (s.startsWith("-")) {
                return DiffColorMapping.deleted;
            }
            if (s.startsWith("+")) {
                return DiffColorMapping.added;
            }
            return DiffColorMapping.default;
        }
        return DiffColorMapping.default;
    }

    async finalize() {
        if (this.option.root) {
            if (this.diffs.length > 0) {
                const pager = await runPager();
                for (const d of this.diffs) {
                    pager.write(`===== ${d.depotFile}#${d.rev} - ${d.clientFile} =====\n`);
                    pager.write("\n");
                    for (const line of this.iterateLine(d.data!)) {
                        pager.write(this.getColor(line)(line));
                        pager.write("\n");
                    }
                    pager.write("\n");
                }
                pager.end();
                await pager.wait();
            }
            // normal messages and errors does not use pager
            for (const message of this.messages) {
                logInfo(message.data.trim());
            }
            for (const error of this.errors) {
                logError(error.data.trim());
            }
        }
        return this.diffs;
    }

}
