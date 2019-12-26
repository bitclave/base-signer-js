import AccessData from './AccessData';

export default class Auth extends AccessData {

    public readonly passPhrase: string;

    public static valueOf(json: any): Auth {
        return new Auth(json.passPhrase, new Set<string>(json.origin), new Date(json.expireDate));
    }

    constructor(
        passPhrase: string = '',
        origin: Set<string> = new Set<string>(),
        expireDate: Date = new Date()
    ) {
        super(origin, expireDate);
        this.passPhrase = passPhrase;
    }
}
