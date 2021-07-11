import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}


export interface IAPIGatewayEvent<T = undefined, V = undefined, W = undefined, Y = IGenericHeaders> {
  requestContext: any;
  body: T;
  headers: Y;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: V;
  queryStringParameters: W;
  stageVariables: {
      [name: string]: string;
  } | null;
  resource: string;
}

export interface IGenericHeaders {
  [name: string]: string;
}

export interface GenericResponse {
  statusCode: number; body: string;
}

export interface IAPIGatewayWebSocketEvent<
T = undefined,
V = undefined,
W = undefined,
Y = IGenericHeaders
> {
requestContext: IRequestContext;
body: T;
headers: Y;
httpMethod: string;
isBase64Encoded: boolean;
path: string;
pathParameters: V;
queryStringParameters: W;
stageVariables: {
  [name: string]: string;
} | null;
resource: string;
}

export interface IRequestContext {
connectionId: string;
eventType: "CONNECT" | "MESSAGE" | "DISCONNECT";
domainName: string;
stage: string;
}