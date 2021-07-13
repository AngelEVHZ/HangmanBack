import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface IDynamoGateway {
    put(data: object, table: string, condition?: string): Promise<boolean>;
    scan<T = object>(scanInput: DocumentClient.ScanInput): Promise<T[]>;
    query<T = object>(queryInput: DocumentClient.QueryInput): Promise<T[]>;
    delete(key: string, value: string, table: string): Promise<boolean>;
    getItem<T = object>(key: string, value: string, table: string): Promise<T>;
}
