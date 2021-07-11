export type containerSymbol = {
    HelloService: symbol;
    DynamoGateway: symbol;
    DocumentClient: symbol;
    SocketService: symbol;
    SocketGateway: symbol;
}

const IDENTIFIERS: containerSymbol = {
    HelloService: Symbol("HelloService"),
    DynamoGateway: Symbol("DynamoGateway"),
    DocumentClient: Symbol("DocumentClient"),
    SocketService: Symbol("SocketService"),
    SocketGateway: Symbol("SocketGateway"),
};

export default IDENTIFIERS;