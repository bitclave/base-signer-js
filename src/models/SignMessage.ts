import AccessToken from './AccessToken';

export default class SignMessage extends AccessToken {

    public readonly message: string;

    constructor(message: string = '', accessToken: string = '') {
        super(accessToken);
        this.message = message;
    }
}
