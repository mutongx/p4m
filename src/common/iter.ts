export function *iterateLine(s: string) {
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
