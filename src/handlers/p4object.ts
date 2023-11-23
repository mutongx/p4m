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
    "Description": ["required", "string"]
} as const;

export const ShelvedFileSpec = {
    "change": ["optional", "string"],
    "openFiles": ["optional", "string"],
    "depotFile": ["required", "string"],
    "rev": ["required", "string"],
    "action": ["required", "string"]
} as const;
