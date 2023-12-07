export function logInfo(s: string = "", newline: boolean = true) {
    process.stdout.write(s);
    if (newline) {
        process.stdout.write("\n");
    }
}

export function logError(s: string = "", newline: boolean = true) {
    process.stderr.write(s);
    if (newline) {
        process.stderr.write("\n");
    }
}
