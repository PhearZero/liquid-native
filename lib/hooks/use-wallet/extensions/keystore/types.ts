export type SecretType = 'bip39' | 'intermezzo' | 'pera'

/**
 * Represents a secret key object used for cryptographic operations.
 *
 * The SecretKey interface defines the structure of a key object that includes metadata
 * and the actual cryptographic material. It supports different key types, allowing
 * flexibility for various cryptographic standards or protocols.
 *
 * Properties:
 * - `id`: A unique identifier for the secret key.
 * - `name`: A human-readable name or label associated with the secret key.
 * - `value`: The actual cryptographic material or secret managed by the key.
 * - `type`: Specifies the key type, which determines the cryptographic standard or protocol
 *           this key adheres to. Accepted values are:
 *           - 'bip39': A key based on the BIP39 mnemonic standard.
 *           - 'intermezzo': A token used to communicate with intermezzo.
 */
export interface SecretKey {
    id: string
    name: string
    value: string
    type: 'bip39' | 'intermezzo' | string // Could be any certificate material like x502
}

/**
 * Represents a secure storage interface for managing cryptographic keys and secrets.
 *
 * This interface serves as a contract for handling secrets in the form of `SecretKey` objects and
 * managing their lifecycle, as well as any associated extensions or plugins.
 *
 * Properties:
 * - `secrets`: An array of `SecretKey` objects, representing the collection of stored secrets.
 * - `activeSecret`: The currently active `SecretKey`, or `null` if no active key is set.
 * - `keystore`: An object that represents additional functionality or extensions tied to the keystore.
 */
export interface KeyStore {
    secrets: Omit<SecretKey, 'value'>[],
    activeSecret: Omit<SecretKey, 'value'> | null,
    keystore: KeyStoreExtension
}

/**
 * Interface representing a KeyStore extension, which provides methods for key management
 * operations, including adding, removing, importing, and exporting secrets.
 */
export interface KeyStoreExtension {
    /**
     * Adds or registers the provided secret key.
     *
     * @function
     * @param {Partial<SecretKey>} key - A partial representation of the secret key to add.
     * @returns {Promise<string>} A promise that resolves the key for chaining.
     */
    add: (key: SecretKey) => Promise<SecretKey>
    /**
     * Removes an item identified by the provided ID.
     *
     * @param {string} id - The unique identifier of the item to be removed.
     * @return {Promise<void>} A promise that resolves when the removal is complete.
     */
    remove: (id: string) => Promise<void>
    /**
     * Imports a secret into the system.
     *
     * @param {string} value - The value of the secret being imported.
     * @param {SecretType} type - The type of the secret (e.g., API key, password, etc.).
     * @param {string} [name] - Optional name to assign to the imported secret.
     * @returns {Promise<SecretKey>} A promise that resolves when the secret has been successfully imported.
     */
    import: (value: string, type: SecretType, name?: string) => Promise<SecretKey>
    /**
     * Exports data associated with the given identifier.
     *
     * This function takes an identifier as input, processes the data
     * associated with it, and returns a promise that resolves to a
     * string representation of the exported data.
     *
     * @param {string} id - A unique identifier used to specify the data to be exported.
     * @returns {Promise<SecretKey>} A promise that resolves to the exported key.
     */
    export: (id: string) => Promise<SecretKey>
}
