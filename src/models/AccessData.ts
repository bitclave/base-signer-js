import AccessToken from './AccessToken';

export default class AccessData extends AccessToken {

    public readonly origin: Set<string>;
    public readonly expireDate: Date;

    constructor(accessToken: string, origin: Set<string>, expireDate: Date) {
        super(accessToken);

        this.origin = origin;
        this.expireDate = expireDate;
    }
}
