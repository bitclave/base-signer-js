import KeyPair from './KeyPair';

export interface KeyPairHelper {

    createKeyPair(passPhrase: string): KeyPair

}
