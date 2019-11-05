import AccessToken from './AccessToken';
import { AccessRight } from './Permissions';

export default class PermissionsFields extends AccessToken {

    public readonly recipient: string;
    public readonly data: Map<string, AccessRight>;

    constructor(accessToken: string = '', recipient: string = '', data: Map<string, AccessRight> = new Map()) {
        super(accessToken);
        this.recipient = recipient;
        this.data = data;
    }
}
