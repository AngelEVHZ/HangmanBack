export type containerSymbol = {
    HelloService: symbol;
}

const IDENTIFIERS: containerSymbol = {
    HelloService: Symbol("HelloService"),
};

export default IDENTIFIERS;