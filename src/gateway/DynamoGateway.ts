import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import { DocumentClient, PutItemInput, PutItemInputAttributeMap, ScanInput, ScanOutput } from "aws-sdk/clients/dynamodb";
import IDENTIFIERS from "../constant/Identifiers";


@injectable()
export class DynamoGateway implements IDynamoGateway {
    private readonly _client: DocumentClient;

    constructor(@inject(IDENTIFIERS.DocumentClient) client: DocumentClient) {
        this._client = client;
    }

    public async put(data: object, table: string, condition?: string): Promise<boolean> {
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

    public async scan<T = object>(scanInput: ScanInput): Promise<T[]> {
        let scanResponse = await this._scan(scanInput);
        try {
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

    private async _scan(scanInput: ScanInput): Promise<ScanOutput> {
        return await this._client.scan(scanInput).promise();
    }


}


