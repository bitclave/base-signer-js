import AccessToken from './AccessToken';
import Permissions from './Permissions';

export default class AccessData extends AccessToken {
    origin: string;
    expireDate: string;
    permissions: Permissions;

    constructor(accessToken: string, origin: string, expireDate: string, permissions: Permissions) {
        super(accessToken);
        this.origin = origin;
        this.expireDate = expireDate;
        this.permissions = permissions;
    }

}
