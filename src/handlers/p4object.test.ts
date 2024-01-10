import { expect, test, describe } from "bun:test";

import { parse } from "./p4object";

describe("ObjectSpect parse", () => {
    test("parse literal field", () => {
        const SimpleObjectSpec = {
            "stringField": ["required", "string"],
            "numberField": ["optional", "number"],
        } as const;
        const data = new Map<string, unknown>([
            ["stringField", "abcde"],
            ["numberField", 100],
        ]);
        expect(parse(SimpleObjectSpec, data)).toEqual({
            "stringField": "abcde",
            "numberField": 100,
        });

    });

    test("parse array field", () => {
        const ArrayObjectSpec = {
            "stringArray": ["array", "string"],
            "numberArray": ["array", "number"],
        } as const;
        const data = new Map<string, unknown>([
            ["stringArray0", "abcd"],
            ["stringArray1", "efgh"],
            ["stringArray2", "ijkl"],
            ["stringArray3", "mnop"],
            ["stringArray4", "qrst"],
            ["stringArray5", "uvwx"],
            ["stringArray6", "yzab"],
            ["stringArray7", "cdef"],
            ["stringArray8", "ghij"],
            ["stringArray9", "klmn"],
            ["stringArray10", "opqr"],
        ]);
        expect(parse(ArrayObjectSpec, data)).toEqual({
            "stringArray": ["abcd", "efgh", "ijkl", "mnop", "qrst", "uvwx", "yzab", "cdef", "ghij", "klmn", "opqr"],
            "numberArray": [],
        });
    });

    test("parse nested object", () => {
        const NestedObjectSpec = {
            "plainField": ["required", "string"],
            "nestedObject": ["required", {
                "nestedField": ["required", "number"],
            }],
        } as const;
        const data = new Map<string, unknown>([
            ["plainField", "abcd"],
            ["nestedField", 10086],
        ]);
        expect(parse(NestedObjectSpec, data)).toEqual({
            "plainField": "abcd",
            "nestedObject": {
                "nestedField": 10086,
            }
        });
    });

    test("parse nested object array", () => {
        const NestedObjectSpec = {
            "plainField": ["required", "number"],
            "nestedObjectArray": ["array", {
                "nestedField": ["required", "string"],
                "anotherNestedField": ["required", "number"],
            }],
        } as const;
        const data = new Map<string, unknown>([
            ["plainField", 1000],
            ["nestedField0", "efgh"],
            ["anotherNestedField0", 1111],
            ["nestedField1", "ijkl"],
            ["anotherNestedField1", 2222],
        ]);
        expect(parse(NestedObjectSpec, data)).toEqual({
            "plainField": 1000,
            "nestedObjectArray": [
                { "nestedField": "efgh", "anotherNestedField": 1111 },
                { "nestedField": "ijkl", "anotherNestedField": 2222 },
            ]
        });
    });

});
