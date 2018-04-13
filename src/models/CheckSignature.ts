import AccessToken from './AccessToken';

export default class CheckSignature extends AccessToken {
    msg: string;
    sig: string;

    constructor(msg: string = '', sig: string = '') {
        this.msg = msg;
        this.sig = sig;
    }

}
