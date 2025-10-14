import { JSON_METADATA, JsonMetadataDictionary } from '../models/json-metadata';
import { JsonPropertyMetadata } from '../models/property-metadata';

export function JsonProperty<ArrayCtor extends new () => object>(
    name: string,
    options?: { arrayType: ArrayCtor }
): PropertyDecorator {
    return <T extends object>(target: T, propName: string | symbol) => {
        if (typeof propName === 'symbol') return;

        const metadata: JsonMetadataDictionary = Reflect.getMetadata(JSON_METADATA, target) ?? {};
        const propMetadata = new JsonPropertyMetadata(target, propName);
        const propType = propMetadata.type;

        metadata[propName] = {
            name,
            type: propType,
            subType:
                propType === 'array'
                    ? options?.arrayType
                    : propType === 'object'
                      ? <any>propMetadata.underlyingType
                      : undefined,
        };

        Reflect.defineMetadata(JSON_METADATA, metadata, target);
    };
}
