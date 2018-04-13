import AccessToken from './AccessToken';

export default class CheckSignature extends AccessToken {
    msg: string;
    sig: string;

    constructor(msg: string = '', sig: string = '', accessToken: string = '') {
        super(accessToken);
        this.msg = msg;
        this.sig = sig;
    }

}
