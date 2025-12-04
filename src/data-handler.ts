import { JsonConverter } from "./json/json-converter";
import { Dictionary } from "./models/generic-types";
import { Response, DataSet, StructureDomain } from "./models/response-model";

export type DataHandlerResult = Dictionary<Dictionary<any>[]>;

export class DataHandler {

    private response: Response;
    private result: DataHandlerResult;

    private structureMapper: { [key: string]: StructureDomain[] };
    private selectMapper: Dictionary<string>;
    // private expressionsMapper: Dictionary<string[]>;
    
    public constructor() {
        this.response = null;
        this.result = null;
        this.structureMapper = {};
        this.selectMapper = {};
        // this.expressionsMapper = {};
    }

    private processNode(node: any, template: Dictionary<any>, structure: StructureDomain[], valueDicts: Dictionary<string[]>): Dictionary<any>[] {
        const itemTemplate = { ...template };
        
        const getValue = (index: number, value: any) => {
            return !!structure[index].domainName ? valueDicts[structure[index].domainName][value] : value;
        }

        if (structure.length === 1) {
            itemTemplate[structure[0].displayName] = getValue(0, node[structure[0].name]);
        } else {
            for (let i = 0; i < structure.length; i++) {
                const value = node["C"][i];
                itemTemplate[structure[i].displayName] = getValue(i, value);
            }
        }

        if (node["M"] && Array.isArray(node["M"])) {
            const childrenResult: Dictionary<any>[] = node["M"].reduce((pv, cv) => {
                const dmKey = Object.keys(cv)[0];
                const result = this.processDataMember(dmKey, cv[dmKey], valueDicts);
                return [...pv, ...result];
            }, []);
            
            return childrenResult.map(child => ({ ...itemTemplate, ...child }));
        }

        return [ { ...itemTemplate } ];
    }

    private getDataMemberStructure(dmKey: string, rawStructure: any[]): StructureDomain[] {
        if (!!this.structureMapper[dmKey]) return this.structureMapper[dmKey];
        if (!rawStructure || !Array.isArray(rawStructure)) return [];

        const structure = rawStructure.map(item => {
            const result = JsonConverter.convert(StructureDomain, item);
            result.displayName = this.selectMapper[result.name];
            return result;
        });

        this.structureMapper[dmKey] = structure;

        return structure;
    }

    private processDataMember(dmkey: string, dataMember: any[], valueDicts: Dictionary<string[]>): Dictionary<any>[] {  
        const structure = this.getDataMemberStructure(dmkey, dataMember[0]["S"]);

        const template = structure.reduce((pv, cv) => {
            pv[cv.displayName] = null;
            return pv;
        }, {} as Dictionary<any>);

        return dataMember.reduce((pv, cv) => {
            const result = this.processNode(cv, template, structure, valueDicts);
            return [...pv, ...result];
        }, []);
    }

    private* processDataSet(item: DataSet) {
        for (const dataMember of item.payloadHierarchy) {
            const dmKey = Object.keys(dataMember)[0];
            if (!Array.isArray(dataMember[dmKey])) continue;

            yield this.processDataMember(dmKey, dataMember[dmKey], item.valueDicts);
        }
    }

    public setResponse(response: Response) {
        this.response = response;

        const data = response.results[0].result.data;

        this.selectMapper = data.descriptor.select.reduce((pv, cv) => {
            pv[cv.value] = cv.name;
            return pv;
        }, {} as Dictionary<string>);
    
        // this.expressionsMapper = data.descriptor.expressions.primary.groupings.reduce((pv, cv) => {
        //     pv[cv.member] = cv.keys.map(key => `${key.source.entity}.${key.source.property}`);
        //     return pv;
        // }, {} as Dictionary<string[]>);
    }

    public async processData(): Promise<void> {
        if (!this.response) throw new Error('You have to set the response first!');
        if (this.result) throw new Error('You have already processed this response!');

        this.result = {};

        return new Promise((res, rej) => {
            try {
                const data = this.response.results[0].result.data;

                for (const dataSet of data.dataSemanticResult.dataSet) {
                    for (const processedDataSet of this.processDataSet(dataSet)) {
                        this.result[dataSet.name] ??= [];
                        this.result[dataSet.name].push(...processedDataSet);
                    }
                }

                res();
            } catch (err: unknown) {
                rej(err);
            }            
        });
    }

    public getResult(): DataHandlerResult {
        return this.result;
    }
}