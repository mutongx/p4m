import { BuffersConsumer } from "./buffers";

enum DataType {
    Null = 0x30, // '0'
    None = 0x4e, // 'N'
    False = 0x46, // 'F'
    True = 0x54, // 'T'
    StopIter = 0x53, // 'S'
    Ellipsis = 0x2e, // '.'
    Int = 0x69, // 'i'
    Int64 = 0x49, // 'I'
    Float = 0x66, // 'f'
    BinaryFloat = 0x67, // 'g'
    Complex = 0x78, // 'x
    BinaryComplex = 0x79, // 'y
    Long = 0x6c, // 'l'
    String = 0x73, // 's'
    Interned = 0x74, // 't'
    Stringref = 0x52, // 'R'
    Tuple = 0x28, // '('
    List = 0x5b, // '['
    Dict = 0x7b, // '{'
    Code = 0x63, // 'c'
    Unicode = 0x75, // 'u'
    Unknown = 0x3f, // '?'
    Set = 0x3c, // '<'
    Frozenset = 0x3e, // '>'
}

interface Pointer {
    type: string
    dirty: boolean
    dataType?: DataType
    obj?: unknown
    objKey?: unknown
}

export class MarshalParser extends BuffersConsumer {
    root: unknown;
    ptrs: Array<Pointer>;

    constructor() {
        super();
        this.root = undefined;
        this.ptrs = [];
    }

    ptr(dirty: boolean = false) {
        if (this.ptrs.length == 0) {
            return null;
        }
        const ptr = this.ptrs[this.ptrs.length - 1];
        if (dirty) {
            ptr.dirty = true;
        }
        return ptr;
    }

    parseType(): boolean {
        const type_buf = this.buffers!.consume(1);
        if (type_buf === null) {
            return false;
        }
        const type = type_buf[0];
        if (DataType[type] === undefined) {
            throw new Error(`unrecognized type: ${type}`);
        }
        this.ptrs[this.ptrs.length - 1].dataType = type;
        return true;
    }

    setValue(value: unknown) {
        const ptr = this.ptr(true)!;
        switch (ptr.type) {
            case "root":
                this.root = value;
                this.ptrs.pop();
                break;
            case "dict":
                if (ptr.objKey === undefined) {
                    ptr.objKey = value;
                } else {
                    (ptr.obj as Map<unknown, unknown>).set(ptr.objKey, value);
                    ptr.objKey = undefined;
                }
                ptr.dataType = undefined;
                break;
            default:
                throw new Error("should never reach this");
        }
    }

    handleNull(): boolean {
        const ptr = this.ptr(true)!;
        switch (ptr.type) {
            case "root":
                throw new Error("encountered null in root object");
            case "dict":
                if (ptr.objKey !== undefined) {
                    throw new Error("incomplete dict");
                }
                this.ptrs.pop();
                this.ptrs.pop();
        }
        return true;
    }

    handleNone(): boolean {
        this.setValue(null);
        return true;
    }

    handleFalse(): boolean {
        this.setValue(false);
        return true;
    }

    handleTrue(): boolean {
        this.setValue(true);
        return true;
    }

    handleInt(): boolean {
        const buf = this.buffers!.consume(4);
        if (buf == null) {
            return false;
        }
        this.setValue(buf.readInt32LE());
        return true;
    }

    handleInt64(): boolean {
        const buf = this.buffers!.consume(8);
        if (buf == null) {
            return false;
        }
        this.setValue(buf.readBigInt64LE());
        return true;
    }

    handleFloat(): boolean {
        const sizeBuf = this.buffers!.peek(1);
        if (sizeBuf == null) {
            return false;
        }
        const size = sizeBuf[0];
        const floatTextBuf = this.buffers!.consume(1 + size);
        if (floatTextBuf == null) {
            return false;
        }
        const floatText = floatTextBuf.toString("utf8", 1);
        this.setValue(parseFloat(floatText));
        return true;
    }

    handleBinaryFloat(): boolean {
        const buf = this.buffers!.consume(8);
        if (buf == null) {
            return false;
        }
        this.setValue(buf.readDoubleLE());
        return true;
    }

    handleString(): boolean {
        const sizeBuf = this.buffers!.peek(4);
        if (sizeBuf == null) {
            return false;
        }
        const size = sizeBuf.readInt32LE();
        const stringBuf = this.buffers!.consume(4 + size);
        if (stringBuf == null) {
            return false;
        }
        this.setValue(stringBuf.toString("utf8", 4));
        return true;
    }

    handleDict(): boolean {
        const ptr = this.ptr(true)!;
        switch (ptr.type) {
            case "root":
                this.root = new Map();
                this.ptrs.push({
                    "type": "dict",
                    "dirty": false,
                    "obj": this.root,
                    "objKey": undefined,
                });
                break;
            default:
                throw new Error("should never reach this");
        }
        return true;
    }

    parse(): boolean {
        const ptr = this.ptr();
        if (ptr == null) {
            throw new Error("no value slots");
        }
        if (ptr.dataType === undefined) {
            return this.parseType();
        }
        switch (ptr.dataType) {
            case DataType.Null:
                return this.handleNull();
            case DataType.None:
                return this.handleNone();
            case DataType.False:
                return this.handleFalse();
            case DataType.True:
                return this.handleTrue();
            case DataType.StopIter:
                throw new Error("StopIter is not supported");
            case DataType.Ellipsis:
                throw new Error("Ellipsis is not supported");
            case DataType.Int:
                return this.handleInt();
            case DataType.Int64:
                return this.handleInt64();
            case DataType.Float:
                return this.handleFloat();
            case DataType.BinaryFloat:
                return this.handleBinaryFloat();
            case DataType.Complex:
                throw new Error("Complex is not supported");
            case DataType.BinaryComplex:
                throw new Error("BinaryComplex is not supported");
            case DataType.Long:
                throw new Error("Long is not supported");
            case DataType.String:
                return this.handleString();
            case DataType.Interned:
                throw new Error("Interned is not supported");
            case DataType.Stringref:
                throw new Error("Stringref is not supported");
            case DataType.Tuple:
                throw new Error("Tuple is not supported");
            case DataType.List:
                throw new Error("List is not supported");
            case DataType.Dict:
                return this.handleDict();
            case DataType.Code:
                throw new Error("Code is not supported");
            case DataType.Unicode:
                throw new Error("Unicode is not supported");
            case DataType.Unknown:
                throw new Error("Unknown is not supported");
            case DataType.Set:
                throw new Error("Set is not supported");
            case DataType.Frozenset:
                throw new Error("Frozenset is not supported");
            default:
                throw new Error(`unrecognized type: ${ptr.dataType}`);
        }
    }

    begin() {
        this.ptrs.push({ "type": "root", "dirty": false });
    }

    override consume() {
        while (this.parse()) {
            if (this.ptrs.length == 0) {
                const result = this.root;
                this.root = undefined;
                this.ptrs.push({ "type": "root", "dirty": false });
                return { action: "response" as const, value: result, yield: true };
            }
        }
        return { action: "request" as const, must: false };
    }

    end() {
        if (this.ptrs[0].dirty) {
            throw new Error("incomplete stream");
        }
    }
}
