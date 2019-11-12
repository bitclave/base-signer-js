import { AccessRight } from './Permissions';
import RpcToken from './RpcToken';

export default class PermissionsFields extends RpcToken {

    public readonly recipient: string;
    public readonly data: Map<string, AccessRight>;

    constructor(accessToken: string = '', recipient: string = '', data: Map<string, AccessRight> = new Map()) {
        super(accessToken);
        this.recipient = recipient;
        this.data = data;
    }
}
