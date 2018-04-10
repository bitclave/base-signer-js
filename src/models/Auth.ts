import AccessToken from './AccessToken';

export default class Auth extends AccessToken {

    passPhrase: string;
    baseUrl: string;
    expireDate: string;

    constructor(passPhrase: string = '', baseUrl: string = '', accessToken: string = '', expireDate: string = '') {
        super(accessToken);
        this.passPhrase = passPhrase;
        this.baseUrl = baseUrl;
        this.expireDate = expireDate;
    }

}
