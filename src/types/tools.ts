export interface Parameter {
    name: string;
    description: string;
    type: "string" | "number" | "boolean" | "object" | "array" | "enum";
    parameters: Parameter[];
}

export interface Tool {
    tool_id: string;
    org_id: string;
    name: string;
    description: string;
    parameters: Parameter[];
    code: string;
}

export interface TestInput {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array" | "enum";
    value: string | number | boolean | TestInput[];
    options?: string[];
    arrayTypeParameter?: Parameter;
}

export type AnyType = string | number | boolean | { [key: string]: AnyType } | AnyType[];