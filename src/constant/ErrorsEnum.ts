export enum ErrorEnum {
    E001 =  "E001",
    E002 =  "E002",
    E003 =  "E003",
    E004 =  "E004",
    E005 =  "E005",
    E006 =  "E006",
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
    },
    E004: {
        statusCode: 400,
        body:"The session is full"
    },
    E005: {
        statusCode: 400,
        body:"Session expired"
    },
    E006: {
        statusCode: 400,
        body:"Invalid code"
    }
};