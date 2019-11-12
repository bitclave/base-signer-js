import Auth from '../../../models/Auth';
import RpcToken, { TokenType } from '../../../models/RpcToken';
import { AccessTokenValidator } from './AccessTokenValidator';

export class AccessTokenValidatorStrategy extends AccessTokenValidator {

    private validators = new Map<TokenType, AccessTokenValidator>();

    public setStrategy(type: TokenType, validator: AccessTokenValidator) {
        this.validators.set(type, validator);
    }

    public validate(token: RpcToken): boolean {
        return this.getValidator(token.tokenType).validate(token);
    }

    public getAuth(token: RpcToken): Auth {
        return this.getValidator(token.tokenType).getAuth(token);
    }

    private getValidator(type: TokenType): AccessTokenValidator {
        const validator = this.validators.get(type);

        if (validator) {
            return validator;
        }

        throw new Error(`Undefined token validator. for type of token: ${type}`);
    }
}
