import type Handler from "../handlers/base";

export default interface Context {
    runP4?: <T>(command: string, args: string[], handler: Handler<T>) => Promise<T>;
    newPager?: () => { write: (s: string) => void, end: () => void, wait: () => Promise<void> };
    printText: (s?: string, n?: boolean) => void;
    printError: (s?: string, n?: boolean) => void;
}
