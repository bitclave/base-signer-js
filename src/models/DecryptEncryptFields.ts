import AccessToken from './AccessToken';

export default class DecryptEncryptFields extends AccessToken {

    fields: Map<string, string>;
    passwords: Map<string, string>;

    constructor(
        accessToken: string = '',
        fields: Map<string, string> = new Map(),
        passwords: Map<string, string> = new Map()
    ) {
        super(accessToken);
        this.fields = fields || new Map();
        this.passwords = passwords || new Map();
    }

}
