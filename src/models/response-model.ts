import { JsonProperty } from '../json/decorators/json-property';
import { JsonObject } from '../json/decorators/json-object';
import { Dictionary } from './generic-types';

@JsonObject()
export class StructureDomain {
    @JsonProperty('N')
    public name: string;

    @JsonProperty('T')
    public type: number;

    @JsonProperty('DN')
    public domainName: string;

    public displayName: string;
}

@JsonObject()
export class GroupingKeySource {
    @JsonProperty('Entity')
    public entity: string;

    @JsonProperty('Property')
    public property: string;
}

@JsonObject()
export class SelectGroupingKey {
    @JsonProperty('Source')
    public source: GroupingKeySource;

    @JsonProperty('Calc')
    public calc: string;

    @JsonProperty('IsSameAsSelect')
    public isSameAsSelect: boolean;
}

@JsonObject()
export class ExpressionGroupingKey {
    @JsonProperty('Source')
    public source: GroupingKeySource;

    @JsonProperty('Select')
    public select: number;
}

@JsonObject()
export class ExpressionGrouping {
    @JsonProperty('Keys', { arrayType: ExpressionGroupingKey })
    public keys: ExpressionGroupingKey[];

    @JsonProperty('Member')
    public member: string;
}

@JsonObject()
export class MetricsEvent {
    @JsonProperty('Id')
    public id: string;

    @JsonProperty('Name')
    public name: string;

    @JsonProperty('Component')
    public component: string;

    @JsonProperty('Start')
    public start: Date;

    @JsonProperty('End')
    public end: Date;

    @JsonProperty('Metrics')
    public metrics: Dictionary<unknown>;
}

@JsonObject()
export class Metrics {
    @JsonProperty('Version')
    public version: string;

    @JsonProperty('Events', { arrayType: MetricsEvent })
    public events: MetricsEvent[];
}

@JsonObject()
export class DescriptorSelect {
    @JsonProperty('Kind')
    public kind: number;

    @JsonProperty('Depth')
    public depth: number;

    @JsonProperty('Value')
    public value: string;

    @JsonProperty('Format')
    public format: string;

    @JsonProperty('GroupKeys', { arrayType: SelectGroupingKey })
    public groupKeys: SelectGroupingKey[];

    @JsonProperty('Name')
    public name: string;
}

@JsonObject()
export class DescriptorExpressionsItem {
    @JsonProperty('Groupings', { arrayType: ExpressionGrouping })
    public groupings: ExpressionGrouping[];
}

@JsonObject()
export class DescriptorExpressions {
    @JsonProperty('Primary')
    public primary: DescriptorExpressionsItem;
}

@JsonObject()
export class Descriptor {
    @JsonProperty('Select', { arrayType: DescriptorSelect })
    public select: DescriptorSelect[];

    @JsonProperty('Expressions')
    public expressions: DescriptorExpressions;

    @JsonProperty('Version')
    public version: number;
}

@JsonObject()
export class DataSet {
    @JsonProperty('N')
    public name: string;

    @JsonProperty('PH', { arrayType: Object })
    public payloadHierarchy: any[];

    @JsonProperty('IC')
    public includeChildren: boolean;

    @JsonProperty('HAD')
    public hasAggregationData: boolean;

    @JsonProperty('ValueDicts')
    public valueDicts: Dictionary<string[]>;
}

@JsonObject()
export class DataSemanticResult {
    @JsonProperty('Version')
    public version: number;

    @JsonProperty('MinorVersion')
    public minorVersion: number;

    @JsonProperty('DS', { arrayType: DataSet })
    public dataSet: DataSet[];
}

@JsonObject()
export class ResultData {
    @JsonProperty('timestamp')
    public timestamp: Date;

    @JsonProperty('rootActivityId')
    public rootActivityId: string;

    @JsonProperty('descriptor')
    public descriptor: Descriptor;

    @JsonProperty('metrics')
    public metrics: Metrics;

    @JsonProperty('fromCache')
    public fromCache: boolean;

    @JsonProperty('dsr')
    public dataSemanticResult: DataSemanticResult;
}

@JsonObject()
export class Result {
    @JsonProperty('data')
    public data: ResultData;
}

@JsonObject()
export class JobResult {
    @JsonProperty('jobId')
    public jobId: string;

    @JsonProperty('result')
    public result: Result;
}

@JsonObject()
export class Response {
    @JsonProperty('jobIds')
    public jobIds: string[];

    @JsonProperty('results', { arrayType: JobResult })
    public results: JobResult[];
}
