import { expect, test, describe } from "bun:test";
import { MarshalParser } from "./marshal";

import type { Subprocess } from "bun";

function generate(objects: string[], version: number = 0) {
    const lines: string[] = [
        "import sys",
        "import marshal",
    ];
    for (const o of objects) {
        lines.push(`marshal.dump(${o}, sys.stdout.buffer, ${version})`);
    }
    return Bun.spawn({
        cmd: ["python3", "-c", lines.join("\n")],
        stdio: ["pipe", "pipe", "inherit"],
    });
}

async function parse(proc: Subprocess<"pipe", "pipe", "inherit">) {
    const parser = new MarshalParser();
    const items: unknown[] = [];
    parser.begin();
    for await (const chunk of proc.stdout) {
        parser.push(Buffer.from(chunk));
        for (const item of parser.iter()) {
            items.push(item);
        }
    }
    parser.end();
    await proc.exited;
    return items;
}

describe("literal", () => {

    test("none", async () => {
        const items = await parse(generate([
            "None",
        ]));
        expect(items).toEqual([
            null,
        ]);
    });

    test("false", async () => {
        const items = await parse(generate([
            "False",
        ]));
        expect(items).toEqual([
            false,
        ]);
    });

    test("true", async () => {
        const items = await parse(generate([
            "True",
        ]));
        expect(items).toEqual([
            true,
        ]);
    });

    test("int", async () => {
        const items = await parse(generate([
            "100",
        ]));
        expect(items).toEqual([
            100,
        ]);
    });

    test("float", async () => {
        const items = await parse(generate([
            "0.0009765625",
        ]));
        expect(items).toEqual([
            0.0009765625,
        ]);
    });

    test("binary float", async () => {
        const items = await parse(generate([
            "0.0009765625",
        ], 2));
        expect(items).toEqual([
            0.0009765625,
        ]);
    });

    test("string", async () => {
        const items = await parse(generate([
            "b'abcd'",
        ]));
        expect(items).toEqual([
            "abcd",
        ]);
    });

    test("dict", async () => {
        const items = await parse(generate([
            "{1:2,3:4}",
        ]));
        expect(items).toEqual([
            new Map([[1, 2], [3, 4]]),
        ]);
    });

    test("multiple streams", async () => {
        const items = await parse(generate([
            "{1:2,3:4}",
            "{b'1':b'2',b'3':b'4'}",
        ]));
        expect(items).toEqual([
            new Map([[1, 2], [3, 4]]),
            new Map([["1", "2"], ["3", "4"]]),
        ]);
    });

});
