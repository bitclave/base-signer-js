import AccessToken from './AccessToken';

export default class EncryptMessage extends AccessToken {

    recipientPk: string;
    message: string;

    constructor(accessToken: string = '', recipientPk: string = '', message: string = '') {
        super(accessToken);
        this.recipientPk = recipientPk;
        this.message = message;
    }

}
