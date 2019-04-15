export interface MessageDecrypt {

    decryptMessage(senderPk: string, encrypted: string): string;

    decryptFields(fields: Map<string, string>, passwords?: Map<string, string>): Map<string, string>;

}
