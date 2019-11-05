import AccessToken from './AccessToken';

export default class DecryptMessage extends AccessToken {

    public readonly senderPk: string;
    public readonly encrypted: string;

    constructor(accessToken: string = '', senderPk: string = '', encrypted: string = '') {
        super(accessToken);
        this.senderPk = senderPk;
        this.encrypted = encrypted;
    }
}
