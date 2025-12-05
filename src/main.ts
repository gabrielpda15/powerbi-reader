import 'reflect-metadata';
import 'dotenv/config';

import { Arguments } from './models/arguments';
import { PowerBIReader } from './powerbi-reader';
import { FileHandler } from './file-handler';
import { PowerBIMapper } from './powerbi-mapper';

async function main() {
    const startDate = new Date();
    const args = Arguments.get();

    if (typeof args.input === 'boolean' || typeof args.output === 'boolean' || typeof args.maps === 'boolean' || typeof args['output-format'] === 'boolean')
        throw new Error('Invalid input and output!');

    const outputFormat = args['output-format'].toLowerCase();
    if (!['json', 'csv'].includes(outputFormat)) {
        throw new Error('The only supported output formats are \'json\' or \'csv\'')
    }

    const powerbiResult = await new PowerBIReader().execute(args.input);
    const mappedResult = await new PowerBIMapper(args.maps).execute(outputFormat, ...powerbiResult);

    const fileHandler = new FileHandler(args.output);
    await fileHandler.writeFiles(outputFormat, ...mappedResult);

    const elapsedTime = new Date().getTime() - startDate.getTime();
    console.log(`Done! ${elapsedTime} ms`);
}

main().catch((err) => console.error(err));
