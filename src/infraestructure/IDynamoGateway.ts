import { ScanInput} from "aws-sdk/clients/dynamodb";

export interface IDynamoGateway {
    put(data: object, table: string, condition?: string): Promise<boolean>;
    scan<T = object>(scanInput: ScanInput): Promise<T[]>;
}
