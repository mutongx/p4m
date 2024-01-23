import Handler from "./base";
import { Texts } from "./consts";
import { parse, ResolveTaskSpec, ResolveResultSpec } from "./p4object";

import { LineIterator } from "../common/iter";
import { colorDiff } from "../common/diff";

import type { ErrorMessage, InfoMessage, StatMessage, TextMessage } from "./base";
import type { P4Object } from "./p4object";

export interface Resolve extends P4Object<typeof ResolveTaskSpec> {
    result: P4Object<typeof ResolveResultSpec> | null
}

export default class ResolveHandler extends Handler<null> {
    currentResolve: Resolve | null = null;
    allResolve: Resolve[] = [];

    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    diffIter: LineIterator | null = null;

    allText: string[] = [...Texts.mergeActionPrompt, ...Texts.mergeHelpText, ...Texts.mergeConfirmationPrompt];
    allPrefix: Set<string> = new Set(this.allText.map((s) => s.substring(0, 3)));
    actionPrefix: Set<string> = new Set(Texts.mergeActionPrompt.map((s) => s.substring(0, 3)));
    helpPrefix: Set<string> = new Set(Texts.mergeHelpText.map((s) => s.substring(0, 3)));

    override stat(stat: StatMessage) {
        if (stat.data.has("resolveType")) {
            const task = parse(ResolveTaskSpec, stat.data);
            this.currentResolve = { ...task, result: null };
            this.allResolve.push(this.currentResolve);
            if (this.option.root) {
                this.ctx.printText(`- To resolve: ${task.clientFile}`);
                this.ctx.printText(`  Client revision: ${task.startFromRev}`);
                this.ctx.printText(`  Target revision: ${task.endFromRev}`);
            }
        } else {
            const result = parse(ResolveResultSpec, stat.data);
            this.currentResolve!.result = result;
            if (this.option.root) {
                this.ctx.printText(`${result.toFile} - ${result.how} ${result.fromFile}`);
            }
        }
    }

    override info(info: InfoMessage) {
        if (this.currentResolve) {
            if (this.option.root) {
                if (info.data.startsWith("Diff chunk: ")) {
                    this.ctx.printText(`  ${info.data}`);
                } else {
                    this.ctx.printText(info.data);
                }
            }
        } else {
            this.messages.push(info);
        }
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    override text(text: TextMessage) {
        if (!this.diffIter) {
            this.diffIter = new LineIterator();
        }
        this.diffIter.put(text.data);
        for (const line of this.diffIter.iter()) {
            this.ctx.printText(colorDiff(line));
        }
    }

    override consume() {
        const peekPrefix = this.buffers!.peek(3);
        if (!peekPrefix) {
            return { action: "request" as const, must: false };
        }
        const peekPrefixStr = peekPrefix.toString();
        if (this.allPrefix.has(peekPrefixStr)) {
            let peek: boolean = false;
            let match: string | null = null;
            for (const toMatch of this.allText) {
                const peekPrompt = this.buffers!.peek(toMatch.length);
                if (!peekPrompt) {
                    continue;
                }
                peek = true;
                if (peekPrompt.toString() == toMatch) {
                    match = toMatch;
                    break;
                }
            }
            if (!peek) {
                return { action: "request" as const, must: true };
            }
            if (!match) {
                throw new Error("failed to match user prompt string");
            }
            if (this.actionPrefix.has(peekPrefixStr)) {
                let promptStr: string | null = null;
                // We assume that the ": " text is at most 100 chars away
                for (let i = 0; i <= 100; ++i) {
                    const peekEnd = this.buffers!.peek(2, i);
                    if (!peekEnd) {
                        return { action: "request" as const, must: false };
                    }
                    if (peekEnd.toString() == ": ") {
                        promptStr = this.buffers!.consume(i + 2)!.toString();
                        break;
                    }
                }
                if (!promptStr) {
                    throw new Error("unable to the end of action prompt string");
                }
                if (this.diffIter) {
                    const end = this.diffIter.end();
                    if (end) {
                        this.ctx.printText(colorDiff(end));
                    }
                    this.diffIter = null;
                }
                this.ctx.printText(promptStr, false);
            } else if (this.helpPrefix.has(peekPrefixStr)) {
                let helpStr: string | null = null;
                // We assume that the "\n\nAcc" text is at most 2000 chars away
                for (let i = 0; i <= 2000; ++i) {
                    const peekEnd = this.buffers!.peek(5, i);
                    if (!peekEnd) {
                        return { action: "request" as const, must: false };
                    }
                    if (peekEnd.toString() == "\n\nAcc") {
                        helpStr = this.buffers!.consume(i + 2)!.toString();
                        break;
                    }
                }
                if (!helpStr) {
                    throw new Error("unable to the end of help string");
                }
                this.ctx.printText(helpStr, false);
            } else {
                this.buffers!.consume(match.length);
                this.ctx.printText(match, false);
            }
        } else {
            return { action: "response" as const, value: null, yield: true };
        }
        return { action: "response" as const, value: null, yield: false };
    }

    finalize() {
        if (this.option.root) {
            for (const message of this.messages) {
                this.ctx.printText(message.data.trim());
            }
            for (const error of this.errors) {
                this.ctx.printError(error.data.trim());
            }
        }
        return null;
    }
}
