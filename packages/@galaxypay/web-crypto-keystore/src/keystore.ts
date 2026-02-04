import type {BaseProvider, ExtensionOptions} from "@algorandfoundation/wallet-provider";
import type {KeyStoreExtension, KeyStoreApi, SecretKey} from "@algorandfoundation/keystore-extension";

/**
 * Initializes and returns a KeyStoreExtension object using the provided BaseProvider and ExtensionOptions.
 *
 * @param {BaseProvider} provider - The base provider containing secret keys.
 * @param {ExtensionOptions} options - The configuration options for the extension, which may include a custom KeyStore or a boolean flag.
 *
 * @returns {KeyStoreExtension} An object containing the secrets from the provided BaseProvider and a KeyStore API implementation.
 */
export const init = (provider: BaseProvider, options: ExtensionOptions): KeyStoreExtension => ({
    secrets: [...provider.secrets] as SecretKey[],
    keystore: typeof options.keystore !== 'boolean' ? options.keystore : {
        secrets: [] as SecretKey[],
        add: async (key: SecretKey) => {throw new Error('Not Implemented')},
        remove: async (id: string) => {throw new Error('Not Implemented')},
        import: async (key: SecretKey) => {throw new Error('Not Implemented')},
        export: async (id: string) => {throw new Error('Not Implemented')},
    } as  KeyStoreApi,
})


// Implementation for Websites