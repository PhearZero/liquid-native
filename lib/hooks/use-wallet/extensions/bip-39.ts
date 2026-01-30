import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {fromSeed} from "@algorandfoundation/xhd-wallet-api";
import {v4 as uuid} from 'uuid';

import {BaseProvider} from "@/lib/hooks/use-wallet/types";
import {SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";

export interface BIP39Extension {
    add?: (name: string, strength: number) => Promise<SecretKey>
    remove?: (id: string) => Promise<void>
    import?: (mnemonic: string, name?: string) => Promise<SecretKey>
    export?: (id: string) => Promise<SecretKey>
    generate: (name?: string, strength?: number) => Promise<SecretKey>
}

export interface BIP39 {
    bip39: BIP39Extension
}

/**
 * Initializes a BIP39-compatible object with optional keystore extensions.
 *
 * @param {BaseProvider} provider - The base provider used to interact with the keystore and other related functionality.
 * @param {any} options - Configuration options that influence the behavior and capabilities of the returned BIP39 object.
 * @returns {BIP39} A BIP39 object extended with keystore capabilities if a keystore is provided in the options.
 *
 * This function supports the following behaviors:
 * - When a keystore is available in the options, additional methods for managing mnemonic-based keys (add, remove, import, export, etc.) are included in the returned object.
 * - When a keystore is not available, the returned object provides basic BIP39 functionality, such as the ability to generate mnemonic-based keys.
 */
const init = (provider: BaseProvider, options: any): BIP39 => {
    // Extend BIP-39 with a Keystore when it is available
    let extended = options.keystore ? {
        bip39: {
            add: async (name: string, strength: number) => await provider.keystore.add(await generateSecretKey(name, strength)),
            remove: (id: string) => provider.keystore.remove(id),
            import: (mnemonic: string, name: string = "Secret Key") => provider.keystore.import(mnemonic, name, "bip39"),
            export: (id: string) => provider.keystore.export(id),
            generate: async (name: string, strength: number)=>await provider.keystore.add(generateSecretKey(name, strength)),
        } as BIP39Extension,
    } : {  }
    return {
        // BIP39 Without a Keystore
        bip39: {
            ...extended.bip39,
            generate: async (name?: string, strength?: number)=>generateSecretKey(name, strength),
        } as BIP39Extension,

    }
}
export default init;

/**
 * Generates a new secret key with the specified parameters.
 *
 * @param {string} [name="Secret Key"] - The base name for the secret key.
 * @param {number} [strength=256] - The strength of the key, typically represented by the number of bits.
 * @return {Promise<SecretKey>} A promise that resolves to the generated secret key object.
 */
export async function generateSecretKey(name: string = "Secret Key", strength: number = 256): Promise<SecretKey> {
    return {
        id: uuid(),
        name,
        value: bip39.generateMnemonic(wordlist, strength),
        type: 'bip39',
    } as SecretKey
}

/**
 * Converts a given SecretKey into a root key using a passphrase.
 *
 * @param {SecretKey} secret - The SecretKey object containing the mnemonic value.
 * @param {string} [passphrase=''] - An optional passphrase for additional security.
 * @return {Promise<Uint8Array>} A promise that resolves to the derived root key.
 */
export async function toRootKey(secret: SecretKey, passphrase: string = ''): Promise<Uint8Array> {
    if(secret.type !== 'bip39') throw new Error(
        `Cannot convert secret key of type ${secret.type} to root key. Expected type 'bip39'`
    )
    return fromMnemonic(secret.value, passphrase)
}

/**
 * Derives a seed from the given mnemonic phrase and optional passphrase.
 *
 * @param {string} phrase - The mnemonic phrase to use for seed derivation. Must be valid according to BIP-39 specifications.
 * @param {string} [passphrase] - An optional passphrase used for additional security. Defaults to an empty string if not provided.
 * @return {Promise<Uint8Array>} A promise that resolves to a Uint8Array representing the derived seed.
 * @throws {Error} If the provided mnemonic phrase is invalid.
 */
export async function fromMnemonic(phrase: string, passphrase: string = ''): Promise<Uint8Array> {
    if (!await isValidMnemonic(phrase)) {
        throw new Error('Invalid mnemonic phrase')
    }
    return fromSeed(Buffer.from(await bip39.mnemonicToSeed(phrase, passphrase)))
}

/**
 * Validates if a given mnemonic phrase is valid according to the BIP-39 standard.
 *
 * @param {string} phrase - The mnemonic phrase to be validated.
 * @return {Promise<boolean>} A promise that resolves to `true` if the phrase is valid, otherwise `false`.
 */
export async function isValidMnemonic(phrase: string): Promise<boolean> {
    return bip39.validateMnemonic(phrase, wordlist)
}
