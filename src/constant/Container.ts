import { Container } from "inversify";
import IDENTIFIERS from "../constant/Identifiers";
import { IHelloService } from "../infraestructure/IHelloService";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import { HelloService } from "../service/HelloService";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoGateway } from "../gateway/DynamoGateway";
import { SocketService } from "../service/SocketService";
import { ISocketService } from "../infraestructure/ISocketService";
 
var CONTAINER = new Container();
CONTAINER.bind<IHelloService>(IDENTIFIERS.HelloService).to(HelloService);
CONTAINER.bind<ISocketService>(IDENTIFIERS.SocketService).to(SocketService);
CONTAINER.bind<IDynamoGateway>(IDENTIFIERS.DynamoGateway).to(DynamoGateway);
CONTAINER.bind<DocumentClient>(IDENTIFIERS.HelloService).toConstantValue(new DocumentClient());

export default CONTAINER;