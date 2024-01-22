import { LineIterator } from "./iter";

describe("LineIterator", () => {
    test("simple iter", () => {
        const li = new LineIterator();
        li.put("a\nb\nc\nd");
        expect([...li.iter()]).toEqual(["a", "b", "c"]);
        expect(li.end()).toEqual("d");
    });
    test("simple iter with new line", () => {
        const li = new LineIterator();
        li.put("a\nb\nc\nd\n");
        expect([...li.iter()]).toEqual(["a", "b", "c", "d"]);
        expect(li.end()).toEqual("");
    });
    test("single call", () => {
        expect([...new LineIterator("aa\nbb\ncc\ndd").iter(true)]).toEqual(["aa", "bb", "cc", "dd"]);
    });
    test("single call with new line", () => {
        expect([...new LineIterator("aa\nbb\ncc\ndd\n").iter(true)]).toEqual(["aa", "bb", "cc", "dd"]);
    });
    test("incomplete stream", () => {
        const li = new LineIterator();
        li.put("aa\nbb\nc");
        expect([...li.iter()]).toEqual(["aa", "bb"]);
        li.put("c\ndd\nee");
        expect([...li.iter()]).toEqual(["cc", "dd"]);
        expect(li.end()).toEqual("ee");
    });
});
