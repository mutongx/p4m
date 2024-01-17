import Handler from "./base";
import { Texts } from "./consts";
import { parse, ResolveTask, ResolveResult } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage, TextMessage } from "./base";
import type { P4Object } from "./p4object";

export default class ResolveHandler extends Handler<null> {
    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];

    allText: string[] = [...Texts.mergeActionPrompt, ...Texts.confirmationPrompt, ...Texts.mergeHelpText];
    allPrefix: Set<string> = new Set(this.allText.map((s) => s.substring(0, 3)));

    override stat(stat: StatMessage) {
        // TODO
    }

    override info(info: InfoMessage) {
        this.messages.push(info);
    }

    override error(error: ErrorMessage) {
        this.errors.push(error);
    }

    override text(text: TextMessage) {
        // TODO
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
            if (peekPrefixStr == "Acc") { // TODO: Fix the hardcode
                let promptStr: string | null = null;
                for (let i = 2; i <= 10; ++i) {
                    const peekFull = this.buffers!.peek(match.length + i);
                    if (!peekFull) {
                        return { action: "request" as const, must: false };
                    }
                    if (peekFull.at(peekFull.length - 2) == 58 /* ":" */ && peekFull.at(peekFull.length - 1) == 32 /* " " */) {
                        promptStr = peekFull.toString();
                        break;
                    }
                }
                if (!promptStr) {
                    throw new Error("unable to find ': ' character in the promot string");
                }
                this.buffers!.consume(promptStr.length);
                this.ctx.printText(promptStr, false);
            } else {
                this.buffers!.consume(match.length);
                this.ctx.printText(match, false);
            }
        } else {
            return { action: "response" as const, value: null, yield: true };
        }
        return { action: "response" as const, value: null, yield: false };
    }

    async finalize() {
        return null;
    }
}
