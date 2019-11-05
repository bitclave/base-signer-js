import AccessToken from './AccessToken';

export default class FieldPassword extends AccessToken {

    public readonly fieldName: string;

    constructor(accessToken: string = '', fieldName: string = '') {
        super(accessToken);
        this.fieldName = fieldName;
    }
}
