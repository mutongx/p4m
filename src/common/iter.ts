export class LineIterator {
    data: string[] = [];
    index: number = 0;
    offset: number = 0;

    constructor(s: string | null = null) {
        if (s !== null) {
            this.data.push(s);
        }
    }

    cut(endIndex: number, endOffset: number) {
        const result: string[] = [];
        for (let idx = this.index; idx <= endIndex; ++idx) {
            const begin = idx == this.index ? this.offset : 0;
            const end = idx == endIndex ? endOffset : this.data[this.index].length;
            result.push(this.data[idx].substring(begin, end));
        }
        return result.join("");
    }

    put(s: string) {
        this.data.push(s);
    }

    *iter(end: boolean = false) {
        let nextIndex = this.index;
        let nextOffset = this.offset;
        while (nextIndex < this.data.length) {
            nextOffset = this.data[nextIndex].indexOf("\n", nextOffset);
            if (nextOffset == -1) {
                if (nextIndex == this.data.length) {
                    break;
                } else {
                    nextIndex += 1;
                    nextOffset = 0;
                }
            } else {
                yield this.cut(nextIndex, nextOffset);
                if (nextOffset == this.data[nextIndex].length) {
                    nextIndex += 1;
                    nextOffset = 0;
                } else {
                    nextOffset += 1;
                }
                this.index = nextIndex;
                this.offset = nextOffset;
            }
        }
        if (end) {
            const endStr = this.end();
            if (endStr.length != 0) {
                yield this.end();
            }
        }
    }

    end() {
        return this.cut(this.data.length - 1, this.data[this.data.length - 1].length);
    }
};
