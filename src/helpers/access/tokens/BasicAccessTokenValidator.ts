import Auth from '../../../models/Auth';
import { AuthData } from '../../../models/AuthData';
import { StringUtils } from '../../../utils/StringUtils';
import { KeyPair } from '../../keypair/KeyPair';
import KeyPairSimple from '../../keypair/KeyPairSimple';
import { AccessTokenValidator } from './AccessTokenValidator';

const bitcore = require('bitcore-lib');

export class BasicAccessTokenValidator extends AccessTokenValidator {

    private readonly authenticatorAddress: string;

    constructor(private readonly authenticatorPublicKey: string, private readonly ownKeyPair: KeyPair) {
        super();

        try {
            this.authenticatorAddress = bitcore.PublicKey
                .fromString(authenticatorPublicKey)
                .toAddress()
                .toString(16);

        } catch (e) {
            console.warn(
                'Cannot create authenticator address for BASIC authorization!\n' +
                'Maybe you forgot setup authenticator public key or something went wrong!\n' +
                'For setup use "environment": "AUTHENTICATOR_PK" or "command arguments": "--authPK"'
            );
        }
    }

    public validate(data: AuthData): boolean {

        try {
            const auth = this.getAuth(data);

            const simpleValidation = !StringUtils.isEmpty(auth.passPhrase) &&
                !StringUtils.isEmpty(auth.origin) &&
                auth.passPhrase.length >= 5 &&
                auth.expireDate.getTime() > new Date().getTime();

            const sigValidation = KeyPairSimple.checkSig(
                this.getClearAccessToken(auth),
                this.authenticatorAddress,
                this.getAccessTokenSig(auth)
            );

            return simpleValidation && sigValidation;

        } catch (e) {
            console.warn(e);
        }

        return false;
    }

    public getAuth(data: AuthData): Auth {
        const strJsonAuth = this.ownKeyPair.decryptMessage(this.authenticatorPublicKey, data.data);
        const result: Auth = Object.assign(new Auth(), JSON.parse(strJsonAuth));

        return new Auth(result.passPhrase, result.accessToken, result.origin, new Date(result.expireDate));
    }

    private getAccessTokenSig(auth: Auth): string {
        return auth.accessToken.substring(32);
    }

    private getClearAccessToken(auth: Auth): string {
        return auth.accessToken.substring(0, 32);
    }
}
