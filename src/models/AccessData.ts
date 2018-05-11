import AccessToken from './AccessToken';

export default class AccessData extends AccessToken {

    origin: string;
    expireDate: string;

    constructor(accessToken: string, origin: string, expireDate: string) {
        super(accessToken);

        this.origin = origin;
        this.expireDate = expireDate;
    }

}
