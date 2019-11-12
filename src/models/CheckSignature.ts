import RpcToken from './RpcToken';

export default class CheckSignature extends RpcToken {

    public readonly msg: string;
    public readonly sig: string;

    constructor(msg: string = '', sig: string = '', accessToken: string = '') {
        super(accessToken);
        this.msg = msg;
        this.sig = sig;
    }
}
