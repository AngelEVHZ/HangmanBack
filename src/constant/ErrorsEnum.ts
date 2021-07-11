export enum ErrorEnum {
    E003 =  "E003",
}
export const ERRORS = {
    E001: {
        statusCode: 400,
        body:"Bad Request"
    },
    E002: {
        statusCode: 400,
        body:"Invalid action"
    },
    E003: {
        statusCode: 500,
        body:"Internal server error"
    }
};