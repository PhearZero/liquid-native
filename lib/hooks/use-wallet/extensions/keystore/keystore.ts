import {BaseProvider} from "@/lib/hooks/use-wallet/types";
import type {KeyStore, SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";

/**
 * Initializes a KeyStore instance with the provided provider and options.
 *
 * This provides the basic interface for handling key material.
 * This example is concise and demonstrates a basic keystore that produces bip39 mnemonic phrases.
 *
 * @param {BaseProvider} provider - The provider containing the implementations and context for working with the KeyStore.
 * @param {any} options - Configuration options used to initialize the KeyStore. It can contain:
 *   - `secrets`: An array of secret keys to initialize the KeyStore with.
 *   - `activeSecret`: The currently active secret key.
 *   - `keystore`: An object containing methods for managing the secrets within the KeyStore:
 *     - `add(name: string, increment: boolean, strength: number): Promise<void>` - Adds a new secret key with the specified parameters.
 *     - `remove(id: string): Promise<void>` - Removes the secret key with the given identifier from the KeyStore.
 *     - `import(mnemonic: string, name: string): Promise<void>` - Imports a secret key from a mnemonic phrase and assigns it the optional name.
 *     - `export(id: string): Promise<string | undefined>` - Exports the value of the secret key with the specified identifier.
 *
 * @returns {KeyStore} An initialized KeyStore instance with the provided configuration.
 */
const init = (provider: BaseProvider, options: any): KeyStore => ({
    secrets: options.secrets || [] as SecretKey[],
    activeSecret: options.activeSecret || null as SecretKey | null,
    keystore: options.keystore || {
        secrets: [] as SecretKey[],
        add: async (name: string, increment: boolean, strength: number) => {throw new Error('Not Implemented')},
        remove: async (id: string) => {throw new Error('Not Implemented')},
        import: async (mnemonic: string, name: string = "Secret Key") => {throw new Error('Not Implemented')},
        export: async (id: string) => {throw new Error('Not Implemented')},
    },
})

export default init;

// Implementation for Websites