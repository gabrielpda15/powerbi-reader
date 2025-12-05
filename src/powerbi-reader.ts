import { Response } from './models/response-model';
import { JsonConverter } from './json/json-converter';
import { DataHandler, DataHandlerResult } from './data-handler';
import { readdir as fsReadDir, readFile as fsReadfile } from 'fs/promises';
import { basename as pathBasename, join as pathJoin } from 'path';
import { request as httpsRequest } from 'https';
import { OutgoingHttpHeaders } from 'http';

type ProcessedData = { name: string; data: DataHandlerResult };
type NameContent = { name: string; content: string };

export class PowerBIReader {
    private async processData(data: NameContent[]): Promise<ProcessedData[]> {
        const resultPromises = data.map(async (fileContent) => {
            const response = JsonConverter.convert(Response, JSON.parse(fileContent.content));
            const dataHandler = new DataHandler();
            dataHandler.setResponse(response);

            await dataHandler.processData();

            return {
                name: fileContent.name,
                data: dataHandler.getResult(),
            };
        });

        return await Promise.all(resultPromises);
    }

    private async post(body: string): Promise<string> {
        const defaultHeaders: OutgoingHttpHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'ActivityId': 'f7a1bdea-de30-4f5a-8ae8-cd1054b5ff7e',
            'Content-Type': 'application/json;charset=UTF-8',
            'Origin': 'https://app.powerbi.com',
            'Referer': 'https://app.powerbi.com/',
            'RequestId': '61ab2e61-8f28-911c-6f2c-c26de015e96c',
            'X-PowerBI-ResourceKey': '5b95b481-bfbc-4287-935e-ce2b20015ab6',
        };

        return new Promise((res, rej) => {
            try {
                const request = httpsRequest(
                    {
                        host: process.env.REQUEST_HOST,
                        path: process.env.REQUEST_PATH,
                        method: 'POST',
                        headers: defaultHeaders,
                    },
                    (response) => {
                        let data = '';

                        response.on('data', (chunk) => {
                            data += chunk.toString();
                        });

                        response.on('end', () => {
                            res(data);
                        });
                    }
                );

                request.on('error', (err) => {
                    rej(err);
                });

                request.write(body, 'utf-8', (err) => {
                    if (!!err) rej(err);
                });

                request.end();
            } catch (err: unknown) {
                rej(err);
            }
        });
    }

    private async requestData(...files: string[]): Promise<NameContent[]> {
        const results: NameContent[] = [];

        for (const file of files) {
            const content = await fsReadfile(file, { encoding: 'utf-8' });
            results.push({
                name: pathBasename(file, '.json'),
                content: await this.post(content),
            });
        }

        return results;
    }

    private async getDirectoryFiles(basePath: string) {
        const path = pathJoin(__dirname, basePath);
        const result = await fsReadDir(path, { encoding: 'utf-8', recursive: true, withFileTypes: true });
        return result.map((item) => pathJoin(item.parentPath, item.name));
    }

    public async execute(path: string) {
        const files = await this.getDirectoryFiles(path);
        const requestedData = await this.requestData(...files);

        const result = await this.processData(requestedData);

        const mappedResult = result.reduce((acc, item) => {
            const mappedItems = Object.keys(item.data).map((key) => ({
                name: `${item.name}.${key}`,
                content: JSON.stringify(item.data[key], null, '\t'),
            }));
            return [...acc, ...mappedItems];
        }, []);

        return mappedResult;
    }
}
