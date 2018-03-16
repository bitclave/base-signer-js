import AccessToken from './AccessToken';

export default class SignMessage extends AccessToken {

    message: string;

    constructor(message: string = '', accessToken: string = '') {
        super(accessToken);
        this.message = message;
    }

}
