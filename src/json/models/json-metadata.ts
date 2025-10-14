export const JSON_METADATA = 'json-metadata';

export type Type = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';

export type JsonMetadataDictionary = { [key: string]: JsonMetadata };

export interface JsonMetadata {
    name: string;
    type: Type | 'array';
    subType?: new () => object;
}
