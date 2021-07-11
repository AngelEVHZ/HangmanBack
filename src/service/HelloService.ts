import { injectable } from "inversify";
import { IAPIGatewayEvent } from "../libs/apiGateway";
import "reflect-metadata";
import { IHelloService } from "../infraestructure/IHelloService";



@injectable()
export class HelloService implements IHelloService {
    public hello(event: IAPIGatewayEvent<any>) { 
            
      console.log("valor",event.body);
        return {
            statusCode: 200,
            body: JSON.stringify("hola " + event.body.name)
        }
     };
 

}


