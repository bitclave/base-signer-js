import AccessToken from './AccessToken';
import { AccessRight } from './Permissions';

export default class PermissionsFields extends AccessToken {

    recipient: string;
    data: Map<string, AccessRight>;

    constructor(accessToken: string = '', recipient: string = '', data: Map<string, AccessRight> = new Map()) {
        super(accessToken);
        this.recipient = recipient;
        this.data = data;
    }

}
