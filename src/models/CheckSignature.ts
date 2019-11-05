import AccessToken from './AccessToken';

export default class CheckSignature extends AccessToken {

    public readonly msg: string;
    public readonly sig: string;

    constructor(msg: string = '', sig: string = '', accessToken: string = '') {
        super(accessToken);
        this.msg = msg;
        this.sig = sig;
    }
}
