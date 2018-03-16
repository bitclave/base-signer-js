import AccessToken from './AccessToken';

export default class FieldPassword extends AccessToken {

    fieldName: string;

    constructor(accessToken: string = '', fieldName: string = '') {
        super(accessToken);
        this.fieldName = fieldName;
    }

}
