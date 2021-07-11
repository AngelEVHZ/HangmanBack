import { Container } from "inversify";
import IDENTIFIERS from "../constant/Identifiers";
import { IHelloService } from "../infraestructure/IHelloService";
import { IDynamoGateway } from "../infraestructure/IDynamoGateway";
import { HelloService } from "../service/HelloService";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoGateway } from "../gateway/DynamoGateway";
import { SocketGateway } from "../gateway/SocketGateway";
import { SocketService } from "../service/SocketService";
import { ISocketService } from "../infraestructure/ISocketService";
import { ISocketGateway } from "../infraestructure/ISocketGateway";
 
var CONTAINER = new Container();
CONTAINER.bind<IHelloService>(IDENTIFIERS.HelloService).to(HelloService);
CONTAINER.bind<ISocketService>(IDENTIFIERS.SocketService).to(SocketService);
CONTAINER.bind<IDynamoGateway>(IDENTIFIERS.DynamoGateway).to(DynamoGateway);
CONTAINER.bind<ISocketGateway>(IDENTIFIERS.SocketGateway).to(SocketGateway);
CONTAINER.bind<DocumentClient>(IDENTIFIERS.DocumentClient).toConstantValue(new DocumentClient());

export default CONTAINER;