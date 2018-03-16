import AccessToken from './AccessToken';

export default class Auth extends AccessToken {

    passPhrase: string;
    baseUrl: string;
    accessToken: string;

    constructor(passPhrase: string = '', baseUrl: string = '', accessToken: string = '') {
        super(accessToken);
        this.passPhrase = passPhrase;
        this.baseUrl = baseUrl;
    }

}
