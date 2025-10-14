export class JsonPropertyMetadata {
    private metadata: () => unknown;

    public constructor(target: object, property: string) {
        this.metadata = Reflect.getMetadata('design:type', target, property);
    }

    private internalInstantiate(ctor: () => unknown): unknown {
        if (typeof ctor !== 'function') return;
        try {
            return ctor();
        } catch {
            return Reflect.construct(ctor, []);
        }
    }

    public instantiate(): unknown {
        if (typeof this.metadata !== 'function') return;
        return this.internalInstantiate(this.metadata);
    }

    public get type() {
        const instance = this.instantiate();
        return typeof instance !== 'object' ? typeof instance : Array.isArray(instance) ? 'array' : 'object';
    }

    public get underlyingType() {
        return this.metadata;
    }
}
