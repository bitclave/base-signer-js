import RpcToken from './RpcToken';

export default class SignMessage extends RpcToken {

    public readonly message: string;

    constructor(message: string = '', accessToken: string = '') {
        super(accessToken);
        this.message = message;
    }
}
