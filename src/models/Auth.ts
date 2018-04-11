import AccessData from './AccessData';
import Permissions from './Permissions';

export default class Auth extends AccessData {

    passPhrase: string;

    constructor(passPhrase: string = '',
                accessToken: string = '',
                origin: string = '',
                expireDate: string = '',
                permissions: Permissions = new Permissions()) {
        super(accessToken, origin, expireDate, permissions);
        this.passPhrase = passPhrase;
    }

}
