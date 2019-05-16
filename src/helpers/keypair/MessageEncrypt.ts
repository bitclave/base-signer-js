import { AccessRight } from '../../models/Permissions';

export interface MessageEncrypt {

    encryptMessage(recipientPk: string, message: string): string;

    encryptFields(fields: Map<string, string>): Map<string, string>;

    encryptPermissionsFields(recipient: string, data: Map<string, AccessRight>): string;

    encryptFieldsWithPermissions(recipient: string, data: Map<string, AccessRight>): Map<string, string>;
}
