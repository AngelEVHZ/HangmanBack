import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import { DocumentClient, PutItemInput, PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";
import IDENTIFIERS from "../constant/Identifiers";


@injectable()
export class DynamoGateway implements IDynamoGateway {
    private readonly _client: DocumentClient;

    constructor(@inject(IDENTIFIERS.DocumentClient) client: DocumentClient) {
        this._client = client;
    }

    public async delete(key: string, value: string, table: string): Promise<boolean> {
        console.log("DYNAMO DELETE", key, value, table);
        const params: DocumentClient.DeleteItemInput = {
            TableName: table,
            Key: {
                [key]: value
            }
        }
        try {
            await this._client.delete(params).promise();
            return true;
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return false;
    }

    public async getItem<T>(key: string, value: string, table: string): Promise<T> {
        console.log("DYNAMO GETITEM", key, value, table);
        const params: DocumentClient.GetItemInput = {
            TableName: table,
            Key: {
                [key]: value
            }
        }
        try {
            const item = await this._client.get(params).promise();
            console.log("ITEM", item);
            return item.Item as T;
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return null;
    }

    public async updateUserHost(key: string, value: string, table: string): Promise<boolean> {
        console.log("DYNAMO UPDATEITEM", key, value, table);
        const params: DocumentClient.UpdateItemInput = {
            TableName: table,
            Key: {
                [key]: value
            },
            ExpressionAttributeValues: {
                ":host": true
            },
            ExpressionAttributeNames: {
                "#host": "host"
            },
            UpdateExpression: "set #host = :host"
        }
        try {
            const item = await this._client.update(params).promise();
            console.log("ITEM", item);
            return true
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return false;
    }

    public async put(data: object, table: string, condition?: string): Promise<boolean> {
        console.log("DYNAMO PUT", data, table);
        const params: PutItemInput = {
            Item: <PutItemInputAttributeMap>data,
            TableName: table
        };
        if (condition) params.ConditionExpression = condition;
        try {
            await this._client.put(params).promise();
            return true;
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return false;
    }

    public async scan<T = object>(scanInput: DocumentClient.ScanInput): Promise<T[]> {
        try {
            let scanResponse = await this._scan(scanInput);
            const items = [];
            scanResponse.Items.forEach((item) => {
                items.push(item);
            });

            console.log("scan", scanResponse, typeof scanResponse.LastEvaluatedKey);
            if (typeof scanResponse.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                scanInput.ExclusiveStartKey = scanResponse.LastEvaluatedKey;
                scanResponse = await this._scan(scanInput);
                scanResponse.Items.forEach((item) => {
                    items.push(item);
                });
                console.log("scan", scanResponse, typeof scanResponse.LastEvaluatedKey);
            }
            return items;
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return [];
    }

    public async query<T = object>(queryInput: DocumentClient.QueryInput): Promise<T[]> {
        console.log("DYNAMO QUERY", queryInput);
        try {
            let response = await this._query(queryInput);
            const items = [];
            response.Items.forEach((item) => {
                items.push(item);
            });

            console.log("query", response);
            return items;
        } catch (error) {
            console.log("DynamoGateway ERROR", error);
        }
        return [];
    }

    private async _scan(scanInput: DocumentClient.ScanInput): Promise<DocumentClient.ScanOutput> {
        return await this._client.scan(scanInput).promise();
    }

    private async _query(queryInput: DocumentClient.QueryInput): Promise<DocumentClient.QueryOutput> {
        return await this._client.query(queryInput).promise();
    }


}


