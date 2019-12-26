import Auth from '../../../models/Auth';
import RpcToken from '../../../models/RpcToken';
import { StringUtils } from '../../../utils/StringUtils';
import { KeyPair } from '../../keypair/KeyPair';
import { AccessTokenValidator } from './AccessTokenValidator';

export class BasicAccessTokenValidator extends AccessTokenValidator {

    constructor(private readonly authenticatorPublicKey: string, private readonly ownKeyPair: KeyPair) {
        super();

        if (StringUtils.isEmpty(authenticatorPublicKey)) {
            console.warn(
                'Cannot create authenticator address for BASIC authorization!\n' +
                'Maybe you forgot setup authenticator public key or something went wrong!\n' +
                'For setup use "environment": "AUTHENTICATOR_PK" or "command arguments": "--authPK"'
            );
        }
    }

    public validate(token: RpcToken): boolean {

        try {
            const auth = this.getAuth(token);

            return !StringUtils.isEmpty(auth.passPhrase) &&
                auth.origin.size > 0 &&
                auth.passPhrase.length >= 5 &&
                auth.expireDate.getTime() > new Date().getTime();

        } catch (e) {
            console.warn(e);
        }

        return false;
    }

    public getAuth(token: RpcToken): Auth {
        const strJsonAuth = this.ownKeyPair.decryptMessage(this.authenticatorPublicKey, token.accessToken);

        return Auth.valueOf(JSON.parse(strJsonAuth));
    }
}
