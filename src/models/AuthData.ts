export enum TokenType {
    BASIC = 'BASIC',
    KEYCLOACK_JWT = 'KEYCLOACK_JWT',
}

export class AuthData {

    public readonly type: TokenType;
    public readonly data: string;

    constructor(type: TokenType, data: string) {
        this.type = type;
        this.data = data;
    }
}
