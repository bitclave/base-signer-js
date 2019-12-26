import { KeyPair } from './KeyPair';

export interface KeyPairHelper {

    createSimpleKeyPair(passPhrase: string): KeyPair;

    createClientKeyPair(passPhrase: string, origin: string): KeyPair;
}
