import { readFile as fsReadfile } from 'fs/promises';
import { join as pathJoin } from 'path';
import { existsSync as fsExists } from 'fs';
import { json2csv } from 'json-2-csv';

export class PowerBIMapper {
    private path: string;

    public constructor(basePath: string) {
        this.path = pathJoin(__dirname, '..', basePath);
    }

    private deepMap(item: any, mapper: { [key: string]: string }): any {
        const mappedItem = {};

        for (const property in item) {
            const key = mapper[property] ?? property;
            const value = typeof item[property] === 'object'
                ? this.deepMap(item[property], mapper) 
                : item[property];

            mappedItem[key] = value;
        }

        return mappedItem;
    }

    private deepMapList(itens: any[], mapper: { [key: string]: string }): any {
        return itens.map(item => this.deepMap(item, mapper));
    }

    public async execute(format: string, ...objects: { name: string, content: string }[]) {
        const result = [];

        const stringify = {
            'json': (obj: any) => JSON.stringify(obj, null, '\t'),
            'csv': (obj: any) => json2csv(obj)
        }[format];

        for (const item of objects) {
            const name = item.name.split('.').slice(0, -1).join('.');
            const mapperPath = pathJoin(this.path, name) + '.mapper.json';
            const hasMapper = fsExists(mapperPath);
            if (!hasMapper) console.warn(`Missing mapper for ${name}`);

            const mapperContent = hasMapper ? await fsReadfile(mapperPath, { encoding: 'utf-8' }) : ''; 
            const mapper = hasMapper ? JSON.parse(mapperContent) : {}; 
            const mappedItem = this.deepMapList(JSON.parse(item.content), mapper);

            result.push({
                name: item.name,
                content: stringify(mappedItem)
            });
        }

        return result;
    }
}
