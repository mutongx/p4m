export class Buffers {

    buffers: Buffer[];
    pos: number;

    constructor() {
        this.buffers = [];
        this.pos = 0;
    }

    push(buf: Buffer) {
        this.buffers.push(buf);
    }

    peek(size: number): Buffer | null {
        if (size > this.size()) {
            return null;
        }

        const result = Buffer.alloc(size);

        let remaining = size;
        let pos = this.pos;
        let index = 0;

        while (remaining > 0) {
            const buf = this.buffers[index];
            let to_copy = buf.length - pos;
            if (remaining < to_copy) {
                to_copy = remaining;
            }
            buf.copy(result, size - remaining, pos, pos + to_copy);
            remaining -= to_copy;
            pos = 0;
            index += 1;
        }

        return result;
    }

    consume(size: number): Buffer | null {
        const result = this.peek(size);
        if (result !== null) {
            this.pos += size;
            while (this.buffers.length > 0 && this.pos >= this.buffers[0].length) {
                this.pos -= this.buffers[0].length;
                this.buffers.shift();
            }
        }
        return result;
    }

    size(): number {
        let result = 0;
        for (const buf of this.buffers) {
            result += buf.length;
        }
        result -= this.pos;
        return result;
    }

}

export class BuffersConsumer {

    buffers: Buffers | null = null;

    consume(): { action: "request", must: boolean } | { action: "response", value: unknown, yield: boolean } {
        return { "action": "response", value: null, yield: true };
    }
    
    own(buffers: Buffers) {
        this.buffers = buffers;
    }

    disown() {
        this.buffers = null;
    }

}