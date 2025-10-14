import { JSON_METADATA, JsonMetadataDictionary } from '../models/json-metadata';
import { JsonObject as JsonObjectModel } from '../models/json-object';
import { JsonPropertyMetadata } from '../models/property-metadata';

export function JsonObject(namingStrategy?: (propName: string) => string) {
    return function <T extends new () => object>(target: T) {
        const instance = new target();
        const metadata: JsonMetadataDictionary = Reflect.getMetadata(JSON_METADATA, instance) ?? {};

        const notFoundProps = Object.keys(instance).filter((key) => !Object.keys(metadata).includes(key));

        const namingStrategyFunc = (propName: string) => {
            if (typeof namingStrategy === 'undefined') return propName;
            return namingStrategy(propName);
        };

        notFoundProps.forEach((prop) => {
            const propMetadata = new JsonPropertyMetadata(instance, prop);
            metadata[prop] = {
                name: namingStrategyFunc(prop),
                type: propMetadata.type,
                subType: propMetadata.type === 'array' ? JsonObjectModel : undefined,
            };
        });

        Reflect.defineMetadata(JSON_METADATA, metadata, instance);
    };
}
