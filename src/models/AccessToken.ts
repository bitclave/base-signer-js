import jwt = require("jsonwebtoken");
import ArgumentUtils from "../utils/ArgumentUtils";
import jwkToPem = require("jwk-to-pem");
import * as request from "request";
import {TokenExpiredError} from "jsonwebtoken";

export default class AccessToken {

    accessToken: string;
    isJWT: boolean = false;
    isValid: boolean = false;
    data: any;
    certs: any = null;

    constructor(accessToken: string = '') {
        this.accessToken = accessToken;

        this.verifyAccessToken();
    }

    public allowRegistration(): boolean {
        return this.isJWT && this.isValid;
    }

    public getPassphrase(): string {
        if (this.isValid && this.isJWT) {
            return this.data.sub;
        }

        return "";
    }

    private getCerts(after) {
        let obj = this;

        let uri = obj.data.iss + '/protocol/openid-connect/certs';

        request.get(
            {
                uri: uri
            }, function (error, response, body) {
                obj.certs = JSON.parse(response.body);

                after();
            });
    }

    private verifyJWT(token, tokenObject, ignoreExpriation = false) {
        let signature_pem: string = "";

        for (let key of this.certs.keys) {
            if (key.kid === tokenObject.header.kid) {
                signature_pem = jwkToPem(key);
                break;
            }
        }

        try {
            this.data = jwt.verify(token, signature_pem,{ignoreExpiration: ignoreExpriation});
            this.isValid = true;
        }
        catch(expiredError) {
            if (expiredError instanceof TokenExpiredError)
                console.log("Token expired at: " + expiredError.expiredAt);
        }
    }

    private verifyAccessToken(): void {
        const signerAllowedIssuer: string = ArgumentUtils.getValue('VALID_TOKEN_ISSUER', '--tokenIssuer', 'https://baseauth.bitclave.com:8443/auth/realms/BASE');
        const signerIgnoreJWTExpirations: string = ArgumentUtils.getValue('IGNORE_TOKEN_EXPIRATION', '--tokenExpiration', 'false');

        if (this.accessToken !== null) {
            let tokenObject: any = jwt.decode(this.accessToken, {complete: true});

            if (tokenObject !== null) {
                this.isJWT = true;
                let obj = this;

                obj.data = tokenObject.payload;

                if (obj.data !== null) {
                    let iss:string = obj.data.iss;

                    if (signerAllowedIssuer === iss) {
                        this.getCerts(function () {
                            obj.verifyJWT(obj.accessToken, tokenObject, signerIgnoreJWTExpirations === "true");
                        })
                    }
                }
            }
        }
    }

    public getAccessTokenSig(): string {
        return this.accessToken.substring(32);
    }

    public getClearAccessToken(): string {
        return this.accessToken.substring(0, 32);
    }

}
