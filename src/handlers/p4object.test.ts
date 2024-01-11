import { parse } from "./p4object";

describe("ObjectSpect parse", () => {
    test("parse simple object", () => {
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
        const ArrayFieldSpec = {
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
        expect(parse(ArrayFieldSpec, data)).toEqual({
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

    test("parse object array", () => {
        const ObjectArraySpec = {
            "plainField": ["required", "number"],
            "objectArray": ["array", {
                "objectArrayStringField": ["required", "string"],
                "objectArrayNumberField": ["required", "number"],
            }],
        } as const;
        const data = new Map<string, unknown>([
            ["plainField", 1000],
            ["objectArrayStringField0", "efgh"],
            ["objectArrayNumberField0", 1111],
            ["objectArrayStringField1", "ijkl"],
            ["objectArrayNumberField1", 2222],
        ]);
        expect(parse(ObjectArraySpec, data)).toEqual({
            "plainField": 1000,
            "objectArray": [
                { "objectArrayStringField": "efgh", "objectArrayNumberField": 1111 },
                { "objectArrayStringField": "ijkl", "objectArrayNumberField": 2222 },
            ]
        });
    });

});
