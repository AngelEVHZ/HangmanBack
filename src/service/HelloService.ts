import { injectable } from "inversify";
import "reflect-metadata";
import { IHelloService } from "../infraestructure/IHelloService";



@injectable()
export class HelloService implements IHelloService {

  
    public hello() { 
        return "HELLOOOO BITCHERS";
     };
 

}


