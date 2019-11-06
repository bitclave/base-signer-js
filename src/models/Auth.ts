import AccessData from './AccessData';

export default class Auth extends AccessData {

    public readonly passPhrase: string;

    constructor(
        passPhrase: string = '',
        accessToken: string = '',
        origin: string = '',
        expireDate: Date = new Date()
    ) {
        super(accessToken, origin, expireDate);
        this.passPhrase = passPhrase;
    }
}
