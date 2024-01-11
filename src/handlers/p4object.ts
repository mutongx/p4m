type TypeSpec = string | ObjectSpec;
type ValueSpec = readonly [Storage: string, Type: TypeSpec];
interface ObjectSpec extends Record<string, ValueSpec> {}

type TypeSpecToType<T extends TypeSpec> =
    T extends ObjectSpec ? P4Object<T> :
    T extends "string" ? string :
    T extends "number" ? number :
    never;

export type P4Object<T extends ObjectSpec> = {
    [K in keyof T]:
	T[K][0] extends "required" ? TypeSpecToType<T[K][1]> :
        T[K][0] extends "optional" ? TypeSpecToType<T[K][1]> | undefined :
        T[K][0] extends "array" ? Array<TypeSpecToType<T[K][1]>> :
        never;
};

export const FileActionSpec = {
    "depotFile": ["required", "string"],
    "clientFile": ["required", "string"],
    "workRev": ["required", "string"],
    "action": ["required", "string"],
    "type": ["required", "string"],
} as const;

export const FileStatusSpec = {
    "depotFile": ["required", "string"],
    "clientFile": ["required", "string"],
    "localFile": ["required", "string"],
    "workRev": ["required", "string"],
    "action": ["required", "string"],
    "change": ["optional", "string"],
    "type": ["required", "string"],
} as const;

export const ChangeConfigSpec = {
    "Change": ["required", "string"],
    "Date": ["required", "string"],
    "Client": ["required", "string"],
    "User": ["required", "string"],
    "Status": ["required", "string"],
    "Type": ["required", "string"],
    "Description": ["required", "string"],
    "Files": ["array", "string"],
} as const;

export const ShelvedFileSpec = {
    "change": ["optional", "string"],
    "openFiles": ["optional", "string"],
    "depotFile": ["required", "string"],
    "rev": ["required", "string"],
    "action": ["required", "string"],
} as const;

export const DiffItemSpec = {
    "depotFile": ["required", "string"],
    "clientFile": ["required", "string"],
    "rev": ["required", "string"],
    "type": ["required", "string"],
} as const;

export function parse<T extends ObjectSpec>(spec: T, message: Map<string, unknown>): P4Object<T> {
    const result: unknown = {};
    const prefixes: Record<string, string[]> = {};

    function initializeFromSpec(spec: ObjectSpec, prefix: string[], inArray: boolean) {
        function assign(prefix: string[], key: string, value: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let obj = result as any;
            for (const p of prefix) {
                obj = obj[p];
            }
            obj[key] = value;
        }
        for (const [key, [storage, type]] of Object.entries(spec)) {
            let inArrayNext = inArray;
            if (storage == "array") {
                // TODO: Move this check to type definition
                if (inArray) {
                    throw new Error("nested array is not supported");
                }
                assign(prefix, key, []);
                inArrayNext = true;
            }
            if (typeof type == "string") {   
                if (!inArrayNext) {
                    assign(prefix, key, undefined);
                }
                prefixes[key] = prefix;
            } else {
                // TODO: Move this check to type definition
                if (inArray) {
                    throw new Error("nested object in array is not supported");
                }
                if (!inArrayNext) {
                    assign(prefix, key, {});
                }
                initializeFromSpec(type, [...prefix, key], inArrayNext);
            }
        }
    }

    function parseArrayFieldKey(key: string): [string, number | null] {
        let numberCount = 0;
        while (numberCount < key.length) {
            const code = key.charCodeAt(key.length - 1 - numberCount);
            if (code < 48 || code > 57) {
                break;
            }
            numberCount++;
        }
        if (numberCount > 0) {
            const realKey = key.substring(0, key.length - numberCount);
            if (Object.hasOwn(prefixes, realKey)) {
                return [
                    key.substring(0, key.length - numberCount),
                    parseInt(key.substring(key.length - numberCount))
                ];
            }
        }
        return [key, null];
    }

    function fillObject(prefix: string[], key: string, index: number | null, value: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj = result as any;
        for (const item of prefix) {
            if (obj[item] === undefined) {
                throw new Error(`unexpected object field: ${item}`);
            }
            if (Array.isArray(obj[item])) {
                if (index === null) {
                    throw new Error(`unexpected array field: ${item}`);
                }
                if (index < obj[item].length) {
                    obj = obj[item][index];
                } else if (index == obj[item].length) {
                    const newObj = {};
                    obj[item].push(newObj);
                    obj = newObj;
                } else {
                    throw new Error(`size of array exceeded: ${item}`);
                }
            } else {
                obj = obj[item];
            }
        }
        if (Array.isArray(obj[key])) {
            if (index === null) {
                // TODO: For fstat command, we have both otherOpen array and otherOpen field. This will fail.
                throw new Error(`unexpected array field: ${key}`);
            }
            if (index != obj[key].length) {
                throw new Error(`unexpected array index: ${key}[${index}]`);
            }
            obj[key].push(value);
        } else {
            obj[key] = value;
        }
    }

    initializeFromSpec(spec, [], false);

    for (const field of message.keys()) {
        const value = message.get(field);
        const [key, index] = parseArrayFieldKey(field);
        if (!Object.hasOwn(prefixes, key)) {
            // TODO: Notify the user about unrecognized field
            continue;
        }
        fillObject(prefixes[key], key, index, value);
    }

    return result as P4Object<T>;
}
