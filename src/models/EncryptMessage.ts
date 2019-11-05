import AccessToken from './AccessToken';

export default class EncryptMessage extends AccessToken {

    public readonly recipientPk: string;
    public readonly message: string;

    constructor(accessToken: string = '', recipientPk: string = '', message: string = '') {
        super(accessToken);
        this.recipientPk = recipientPk;
        this.message = message;
    }
}
