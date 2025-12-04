import { mkdir, existsSync, rm, writeFile } from 'fs';
import { join as pathJoin } from 'path';

export class FileHandler {

    private path: string;
    private forceDelete: boolean;

    public constructor(basePath: string, forceDelete: boolean = true) {
        this.path = pathJoin(__dirname, '..', basePath);
        this.forceDelete = forceDelete;
    }

    private async writeFile(file: string, data: string): Promise<void> {
        return new Promise((res, rej) => {
            writeFile(file, data, { encoding: 'utf-8' }, (err) => {
                if (err) rej(err);
                else res();
            });
        });
    }

    private async mkdir(path: string): Promise<void> {
        return new Promise((res, rej) => {
            mkdir(path, { recursive: true }, (err) => {
                if (err) rej(err);
                else res();
            });
        });
    }

    private async rmdir(path: string): Promise<void> {
        return new Promise((res, rej) => {
            rm(path, { force: true, recursive: true, maxRetries: 3 }, (err) => {                
                if (err) rej(err);
                else res();
            });
        });
    }

    private async exists(path: string): Promise<boolean> {
        return new Promise((res, rej) => {
            try {
                res(existsSync(path));
            } catch (err) {
                rej(err);
            }
        });
    }

    private async ensureDirectoryExists(): Promise<void> {
        var exists = await this.exists(this.path);

        if (exists && !this.forceDelete) return;
        if (this.forceDelete) await this.rmdir(this.path);
        
        await this.mkdir(this.path);
    }

    public async writeFiles(...files: { name: string, content: string }[]): Promise<void> {
        await this.ensureDirectoryExists();

        const fileWritePromises = files.map(async file => {
            const filePath = pathJoin(this.path, file.name) + '.json';
            await this.writeFile(filePath, file.content);
        });

        await Promise.all(fileWritePromises);
    }
}