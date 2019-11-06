import Auth from '../../../models/Auth';
import { AuthData, TokenType } from '../../../models/AuthData';
import { AccessTokenValidator } from './AccessTokenValidator';

export class AccessTokenValidatorStrategy extends AccessTokenValidator {

    private validators = new Map<TokenType, AccessTokenValidator>();

    public setStrategy(type: TokenType, validator: AccessTokenValidator) {
        this.validators.set(type, validator);
    }

    public validate(data: AuthData): boolean {
        return this.getValidator(data.type).validate(data);
    }

    public getAuth(data: AuthData): Auth {
        return this.getValidator(data.type).getAuth(data);
    }

    private getValidator(type: TokenType): AccessTokenValidator {
        const validator = this.validators.get(type);

        if (validator) {
            return validator;
        }

        throw new Error(`Undefined token validator. for type of token: ${type}`);
    }
}
