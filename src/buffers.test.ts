import Buffers from "./buffers";

describe("Buffers", () => {

    test("parse single buffer", () => {

        const bufs = new Buffers();
        const b1 = Buffer.alloc(5, "abcde");
        bufs.push(b1);
        expect(bufs.buffers.length).toEqual(1);

        const p1 = bufs.peek(1);
        expect(p1).not.toBeNull();
        expect(Buffer.alloc(1, "a").equals(p1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

        const c1 = bufs.consume(1);
        expect(c1).not.toBeNull();
        expect(Buffer.alloc(1, "a").equals(c1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

        const c2 = bufs.consume(1);
        expect(c2).not.toBeNull();
        expect(Buffer.alloc(1, "b").equals(c2!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

        const c3 = bufs.consume(5);
        expect(c3).toBeNull();
        expect(bufs.buffers.length).toEqual(1);

        const c4 = bufs.consume(3);
        expect(c4).not.toBeNull();
        expect(Buffer.alloc(3, "cde").equals(c4!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(0);

        const c5 = bufs.consume(1);
        expect(c5).toBeNull();
        expect(bufs.buffers.length).toEqual(0);

    });

    test("parse two buffers", () => {

        const bufs = new Buffers();
        const b1 = Buffer.alloc(5, "abcde");
        const b2 = Buffer.alloc(3, "fgh");
        bufs.push(b1);
        bufs.push(b2);
        expect(bufs.buffers.length).toEqual(2);

        const p1 = bufs.peek(5);
        expect(p1).not.toBeNull();
        expect(Buffer.alloc(5, "abcde").equals(p1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(2);

        const c1 = bufs.consume(7);
        expect(c1).not.toBeNull();
        expect(Buffer.alloc(7, "abcdefg").equals(c1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

        const p2 = bufs.peek(1);
        expect(p2).not.toBeNull();
        expect(Buffer.alloc(1, "h").equals(p2!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

        const p3 = bufs.peek(2);
        expect(p3).toBeNull();
        expect(bufs.buffers.length).toEqual(1);

        const c2 = bufs.consume(1);
        expect(c2).not.toBeNull();
        expect(Buffer.alloc(1, "h").equals(c2!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(0);

        const p4 = bufs.peek(1);
        expect(p4).toBeNull();
        expect(bufs.buffers.length).toEqual(0);

    });

    test("parse three buffers", () => {


        const bufs = new Buffers();
        const b1 = Buffer.alloc(5, "abcde");
        const b2 = Buffer.alloc(3, "fgh");
        const b3 = Buffer.alloc(2, "ij");
        bufs.push(b1);
        bufs.push(b2);
        bufs.push(b3);
        expect(bufs.buffers.length).toEqual(3);

        const p1 = bufs.peek(9);
        expect(p1).not.toBeNull();
        expect(Buffer.alloc(9, "abcdefghi").equals(p1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(3);

        const c1 = bufs.consume(9);
        expect(c1).not.toBeNull();
        expect(Buffer.alloc(9, "abcdefghi").equals(c1!)).toBeTruthy();
        expect(bufs.buffers.length).toEqual(1);

    });

});