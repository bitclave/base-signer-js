export enum TokenType {
    BASIC = 0,
    KEYCLOACK_JWT = 1,
}

export default class RpcToken {

    public readonly accessToken: string;
    public readonly tokenType: TokenType;

    constructor(accessToken: string = '', tokenType: TokenType = TokenType.BASIC) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
    }
}
