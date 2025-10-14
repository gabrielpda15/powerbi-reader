import { JSON_METADATA, JsonMetadataDictionary } from './models/json-metadata';

export class JsonConverter {
    private constructor() {}

    public static stringify(object: object): string {
        const metadata: { [key: string]: string } = Reflect.getMetadata(JSON_METADATA, object);

        if (!metadata) return JSON.stringify(object);

        const result: { [key: string]: unknown } = {};

        for (const key in object) {
            const newKey: string = metadata[key];
            const value = (<any>object)[key];
            switch (typeof value) {
                case 'function':
                case 'undefined':
                    break;
                case 'object':
                    if (Array.isArray(value)) {
                        result[newKey] = value.map((each) => this.stringify(each));
                        break;
                    }

                    result[newKey] = this.stringify(value);
                    break;
                default:
                    result[newKey] = value;
                    break;
            }
        }

        return JSON.stringify(result);
    }

    public static parse<T extends object>(ctor: new () => T, json: string): T {
        const instance = new ctor();
        const metadata: JsonMetadataDictionary = Reflect.getMetadata(JSON_METADATA, instance);
        if (!metadata) return JSON.parse(json);

        const invertedMetadata = Object.keys(metadata).reduce((acc, value) => {
            const currentMetadata = metadata[value];
            acc[currentMetadata.name] = {
                name: value,
                type: currentMetadata.type,
                subType: currentMetadata.subType,
            };
            return acc;
        }, {} as JsonMetadataDictionary);

        const obj = JSON.parse(json);
        for (const objKey in obj) {
            const propMetadata = invertedMetadata[objKey];
            if (propMetadata == null) continue;

            const value = obj[objKey];

            switch (propMetadata.type) {
                case 'function':
                case 'undefined':
                    break;
                case 'object':
                    if (propMetadata.subType == null) break;
                    (<any>instance)[propMetadata.name] = this.parse(propMetadata.subType, JSON.stringify(value));
                    break;
                case 'array':
                    if (propMetadata.subType == null) break;
                    if (!Array.isArray(value)) break;
                    (<any>instance)[propMetadata.name] = value.map((each) =>
                        this.parse(propMetadata.subType!, JSON.stringify(each))
                    );
                    break;
                default:
                    (<any>instance)[propMetadata.name] = value;
                    break;
            }
        }

        return instance;
    }

    public static convert<T extends object>(ctor: new () => T, value: object) {
        return this.parse(ctor, JSON.stringify(value));
    }
}
