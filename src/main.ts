import 'reflect-metadata';
import { Response } from './models/response-model';
import { JsonConverter } from './json/json-converter';
import { DataHandler } from './data-handler';
import { mkdirSync, existsSync, rmSync, writeFileSync } from 'fs';
import { join as pathJoin } from 'path';

async function main() {
    const startDate = new Date();

    const response = JsonConverter.convert(Response, await import(process.argv[2]));
    const dataHandler = new DataHandler();
    dataHandler.setResponse(response);

    await dataHandler.processData();

    const result = dataHandler.getResult();

    const path = pathJoin(__dirname, '../output');
    if (existsSync(path)) rmSync(path, { recursive: true, force: true });
    if (!existsSync(path)) mkdirSync(path);

    for (const dataSetName in result) {
        const filePath = pathJoin(path, `${dataSetName}.json`);
        writeFileSync(filePath, JSON.stringify(result[dataSetName], null, '\t'), { encoding: 'utf-8' });
    }

    const elapsedTime = new Date().getTime() - startDate.getTime();
    console.log(`Done! ${elapsedTime} ms`);
}

main().catch(err => console.error(err));