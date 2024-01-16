import Handler from "./base";
import { Texts } from "./consts";
import { parse } from "./p4object";

import type { ErrorMessage, InfoMessage, StatMessage } from "./base";
import type { P4Object } from "./p4object";

export default class ResolveHandler extends Handler<null> {

    messages: InfoMessage[] = [];
    errors: ErrorMessage[] = [];
    peekPrefixes: Set<string> = new Set(["Ac", ...Texts.confirmationPrompt.map((s) => s.substring(0, 2))]);

    stat(stat: StatMessage) {
        // TODO
    }

    info(info: InfoMessage) {
        this.messages.push(info);
    }

    error(error: ErrorMessage) {
        this.errors.push(error);
    }

    run() {
        const peekPrefix = this.buffers!.peek(2);
        if (!peekPrefix) {
            return { action: "request" as const, must: false };
        }
        const peekPrefixStr = peekPrefix.toString();
        if (!this.peekPrefixes.has(peekPrefixStr)) {
            return { action: "response" as const, value: null, yield: true };
        }
        if (peekPrefixStr == "Ac") {
            let peek: boolean = false;
            let match: string | null = null;
            for (const toMatch of Texts.mergeActionPrompt) {
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
                throw new Error("failed to match merge action prompt string");
            }
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
            let peek: boolean = false;
            let match: string | null = null;
            for (const toMatch of Texts.confirmationPrompt) {
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
                throw new Error("failed to match confirmation prompt string");
            }
            this.buffers!.consume(match.length);
            this.ctx.printText(match, false);
        }
        return { action: "response" as const, value: null, yield: false };
    }

    async finalize() {
        return null;
    }

}
