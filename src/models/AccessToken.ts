import jwt = require("jsonwebtoken");
import ArgumentUtils from "../utils/ArgumentUtils";
import jwkToPem = require("jwk-to-pem");
import * as request from "request";
import {TokenExpiredError} from "jsonwebtoken";

export default class AccessToken {

    accessToken: string;
    private isJWT: boolean = false;
    private isValid: boolean = false;
    private data: any;
    private certs: any = null;
    protected verified: boolean = false;

    protected signerAllowedIssuer: string = ArgumentUtils.getValue('VALID_TOKEN_ISSUER', '--tokenIssuer', 'https://baseauth.bitclave.com:8443/auth/realms/BASE');
    protected signerIgnoreJWTExpiry: string = ArgumentUtils.getValue('IGNORE_TOKEN_EXPIRATION', '--tokenExpiration', 'false');

    constructor(accessToken: string = '') {
        this.accessToken = accessToken;
    }

    public badOrExpired(): boolean {
        return this.isJWT && !this.isValid;
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

    protected getCerts(after: any = null) {
        let obj = this;

        if (obj.certs === null) {
            let uri = obj.signerAllowedIssuer + '/protocol/openid-connect/certs';

            request.get(
                {
                    uri: uri
                }, function (error, response, body) {
                    obj.certs = JSON.parse(response.body);

                    if (after !== null)
                        after();
                });
        }
        else {
            if (after !== null)
                after();
        }
    }

    protected verifyJWT(token, tokenObject, ignoreExpriation = false) {
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

        this.verified = true;
    }

    public verifyAccessToken(): Promise<void> {
        let obj: any = this;

        return new Promise(function(resolve, reject) {
            if (!obj.verified) {
                if (obj.accessToken !== null) {
                    let tokenObject: any = jwt.decode(obj.accessToken, {complete: true});

                    if (tokenObject !== null) {
                        obj.isJWT = true;
                        obj.data = tokenObject.payload;

                        if (obj.data !== null) {
                            let iss: string = obj.data.iss;

                            if (obj.signerAllowedIssuer === iss) {
                                obj.getCerts(function () {
                                    obj.verifyJWT(obj.accessToken, tokenObject, obj.signerIgnoreJWTExpiry === "true");
                                    resolve();
                                });
                            }
                        }
                    }
                }
            }
            else {
                resolve();
            }
        });
    }

    public getAccessTokenSig(): string {
        return this.accessToken.substring(32);
    }

    public getClearAccessToken(): string {
        return this.accessToken.substring(0, 32);
    }

    getOrigin() {
        // TODO load from token
        return "";
    }

    getExpireDate() {
        // TODO load from token
        return "";
    }
}
