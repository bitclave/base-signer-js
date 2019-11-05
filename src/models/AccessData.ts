import AccessToken from './AccessToken';

export default class AccessData extends AccessToken {

    public readonly origin: string;
    public readonly expireDate: string;

    constructor(accessToken: string, origin: string, expireDate: string) {
        super(accessToken);

        this.origin = origin;
        this.expireDate = expireDate;
    }
}
