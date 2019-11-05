import AccessToken from './AccessToken';

export default class DecryptEncryptFields extends AccessToken {

    public readonly fields: Map<string, string>;
    public readonly passwords: Map<string, string>;

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
