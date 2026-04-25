import { JsonSchema, UIParameterNode } from '@/types/parameterdefinition';

/**
 * Convert the UI builder's recursive `UIParameterNode` tree into a canonical
 * JSON Schema (Draft 2020-12) suitable for the API and downstream LLM
 * providers. The produced schema is always rooted at an `object`.
 */
export function uiTreeToJsonSchema(nodes: UIParameterNode[]): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];
    nodes.forEach((node) => {
        if (!node.name) return;
        properties[node.name] = uiNodeToSchema(node);
        if (node.required) required.push(node.name);
    });
    return {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties,
        required,
        additionalProperties: false,
    };
}

function uiNodeToSchema(node: UIParameterNode): JsonSchema {
    if (node.type === 'object') {
        const properties: Record<string, JsonSchema> = {};
        const required: string[] = [];
        node.parameters.forEach((child) => {
            if (!child.name) return;
            properties[child.name] = uiNodeToSchema(child);
            if (child.required) required.push(child.name);
        });
        const out: JsonSchema = {
            type: 'object',
            description: node.description,
            properties,
            required,
            additionalProperties: false,
        };
        if (node.defaultValue !== undefined) out.default = node.defaultValue;
        return out;
    }

    if (node.type === 'array') {
        const itemNode = node.parameters[0];
        const items: JsonSchema = itemNode
            ? uiNodeToSchema(itemNode)
            : { type: 'string' };
        return {
            type: 'array',
            description: node.description,
            items,
        };
    }

    if (node.type === 'enum') {
        return {
            type: 'string',
            description: node.description,
            enum: node.parameters.map((p) => p.name),
        };
    }

    const out: JsonSchema = {
        type: node.type,
        description: node.description,
    };
    if (node.defaultValue !== undefined) out.default = node.defaultValue;
    return out;
}

/**
 * Inverse of `uiTreeToJsonSchema`. Walks an object-rooted JSON Schema and
 * rebuilds the UI tree consumed by the editors. Best-effort for schemas
 * outside the v1 supported feature surface — unknown keywords are dropped
 * from the UI representation but preserved on save through round-tripping.
 */
export function jsonSchemaToUiTree(schema: JsonSchema | undefined): UIParameterNode[] {
    if (!schema || schema.type !== 'object' || !schema.properties) return [];
    const required = new Set(schema.required || []);
    return Object.entries(schema.properties).map(([name, child]) =>
        schemaToUiNode(name, child, required.has(name))
    );
}

function schemaToUiNode(name: string, schema: JsonSchema, isRequired: boolean): UIParameterNode {
    const description = schema.description || '';

    if (Array.isArray(schema.enum) && schema.enum.length > 0) {
        return {
            name,
            description,
            type: 'enum',
            required: isRequired,
            parameters: schema.enum.map((value) => ({
                name: String(value),
                description: '',
                type: 'string',
                required: false,
                parameters: [],
            })),
        };
    }

    if (schema.type === 'object') {
        const required = new Set(schema.required || []);
        const properties = schema.properties || {};
        return {
            name,
            description,
            type: 'object',
            required: isRequired,
            parameters: Object.entries(properties).map(([childName, childSchema]) =>
                schemaToUiNode(childName, childSchema, required.has(childName))
            ),
            defaultValue: scalarDefault(schema.default),
        };
    }

    if (schema.type === 'array') {
        const items = schema.items;
        return {
            name,
            description,
            type: 'array',
            required: isRequired,
            parameters: items ? [schemaToUiNode('item', items, false)] : [],
        };
    }

    const primitiveType = primitiveSchemaType(schema.type);
    return {
        name,
        description,
        type: primitiveType,
        required: isRequired,
        parameters: [],
        defaultValue: scalarDefault(schema.default),
    };
}

function primitiveSchemaType(t: JsonSchema['type']): UIParameterNode['type'] {
    if (t === 'integer') return 'integer';
    if (t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';
    return 'string';
}

function scalarDefault(value: JsonSchema['default']): UIParameterNode['defaultValue'] {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    return undefined;
}
