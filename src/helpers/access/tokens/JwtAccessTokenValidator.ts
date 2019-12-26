import Auth from '../../../models/Auth';
import RpcToken from '../../../models/RpcToken';
import { StringUtils } from '../../../utils/StringUtils';
import { AccessTokenValidator } from './AccessTokenValidator';

const jwt = require('jsonwebtoken');

export class JwtAccessTokenValidator extends AccessTokenValidator {

    private readonly validCert: string;

    constructor(rawCertificate: string) {
        super();

        try {
            this.validCert = this.convertCertificate(rawCertificate);
        } catch (e) {
            console.warn(
                'Certificate of RSA to validation JWT token is empty!\n' +
                'Maybe you forgot setup certificate of RSA key or something went wrong!\n' +
                'For setup use "environment": "JWT_RSA_CERT" or "command arguments": "--jwtRsaCert"'
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
        const decrypted = jwt.verify(
            token.accessToken,
            this.validCert,
            {ignoreExpiration: false}
        );

        const origins = new Set<string>(decrypted['allowed-origins']);

        return new Auth(
            decrypted.sub,
            origins,
            new Date((Number(decrypted.exp) || 0) * 1000)
        );
    }

    private convertCertificate(rawCert: string): string {
        if (StringUtils.isEmpty(rawCert)) {
            throw new Error('certificate is empty!');
        }

        // Certificate must be in this specific format or else the function won't accept it
        const beginCert = '-----BEGIN CERTIFICATE-----';
        const endCert = '-----END CERTIFICATE-----';
        let cert = rawCert;

        if (!cert.indexOf(beginCert) && !cert.indexOf(endCert)) {
            cert = `${beginCert} ${rawCert} ${endCert}`;
        }

        cert = cert.replace('\n', '');
        cert = cert.replace(beginCert, '');
        cert = cert.replace(endCert, '');

        let result = beginCert;
        while (cert.length > 0) {

            if (cert.length > 64) {
                result += '\n' + cert.substring(0, 64);
                cert = cert.substring(64, cert.length);

            } else {
                result += '\n' + cert;
                cert = '';
            }
        }

        if (result[result.length] !== '\n') {
            result += '\n';
        }

        result += endCert + '\n';
        return result;
    }
}
