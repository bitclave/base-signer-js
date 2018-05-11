import AccessToken from './AccessToken';

export default class DecryptEncryptFields extends AccessToken {

    fields: Map<string, string>;

    constructor(accessToken: string = '', fields: Map<string, string> = new Map()) {
        super(accessToken);
        this.fields = fields;
    }

}
