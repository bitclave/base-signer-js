export default class AccessData {

    public readonly origin: Set<string>;
    public readonly expireDate: Date;

    constructor(origin: Set<string>, expireDate: Date) {

        this.origin = origin;
        this.expireDate = expireDate;
    }
}
