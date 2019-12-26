import RpcToken from './RpcToken';

export default class EncryptMessage extends RpcToken {

    public readonly recipientPk: string;
    public readonly message: string;

    constructor(accessToken: string = '', recipientPk: string = '', message: string = '') {
        super(accessToken);
        this.recipientPk = recipientPk;
        this.message = message;
    }
}
