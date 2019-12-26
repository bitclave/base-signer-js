import RpcToken from './RpcToken';

export default class FieldPassword extends RpcToken {

    public readonly fieldName: string;

    constructor(accessToken: string = '', fieldName: string = '') {
        super(accessToken);
        this.fieldName = fieldName;
    }
}
