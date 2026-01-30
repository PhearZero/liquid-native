import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {v4 as uuid} from 'uuid';

import {BaseProvider} from "@/lib/hooks/use-wallet/types";
import type {KeyStore, SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";
export const MASTER_KEY_PAIRS_KEY = 'algo_master_key_pairs'
export const ACTIVE_MASTER_KEY_ID_KEY = 'algo_active_master_key_id'

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
        add: async (key: SecretKey) => await saveSecretKey(key),
        remove: async (id: string) => await removeSecretKey(id),
        import: async (value: string, name: string = "Secret Key", type: string) => await saveSecretKey({id: uuid(), name, value, type}),
        export: async (id: string) => (await getSecretKeyById(id))?.value,
    },
})

export default init;

// Implementation for React Native

/**
 * Saves a secret key to persistent storage. Updates the key if it already exists, or adds it if it's new.
 * If there are no active keys set, the given key is set as the active one.
 *
 * @param {SecretKey} keyPair - The key pair object that contains the secret key and its associated metadata.
 * @return {Promise<string>} A promise that resolves to the ID of the saved or updated key.
 */
export async function saveSecretKey(keyPair: SecretKey): Promise<string> {
    // TODO: Optimize the storage to key-value pairs
    const pairs = await getAllSecretKey()
    const index = pairs.findIndex((p) => p.id === keyPair.id)
    if (index >= 0) {
        pairs[index] = keyPair
    } else {
        pairs.push(keyPair)
    }
    await SecureStore.setItemAsync(MASTER_KEY_PAIRS_KEY, JSON.stringify(pairs))

    // If it's the first one, or if no active key is set, set it as active
    const activeId = await getActiveSecretKeyId()
    if (!activeId) {
        await setActiveSecretKeyId(keyPair.id)
    }
    return keyPair.id
}

/**
 * Retrieves all secret keys stored in the secure storage.
 *
 * @return {Promise<SecretKey[]>} A promise that resolves to an array of secret keys.
 * If no keys are found, returns an empty array.
 */
export async function getAllSecretKey(): Promise<SecretKey[]> {
    const value = await SecureStore.getItemAsync(MASTER_KEY_PAIRS_KEY)
    return value ? JSON.parse(value) : []
}

/**
 * Retrieves a secret key based on the provided ID.
 *
 * @param {string} id - The unique identifier of the secret key to retrieve.
 * @return {Promise<SecretKey|null>} A promise that resolves to the secret key object if found, or null if no matching key is found.
 */
export async function getSecretKeyById(id: string): Promise<SecretKey | null> {
    const pairs = await getAllSecretKey()
    return pairs.find((p) => p.id === id) || null
}

/**
 * Retrieves the active secret key ID from persistent storage.
 *
 * This method asynchronously fetches the active secret key ID stored under a predefined key.
 * If no active key is found, it returns null.
 *
 * @return {Promise<string | null>} A promise that resolves to the active secret key ID as a string, or null if not set.
 */
export async function getActiveSecretKeyId(): Promise<string | null> {
    return await AsyncStorage.getItem(ACTIVE_MASTER_KEY_ID_KEY)
}

/**
 * Updates the active secret key identifier stored in the application.
 *
 * @param {string|null} id - The secret key identifier to set as active. If null, the active secret key will be removed.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function setActiveSecretKeyId(id: string | null): Promise<void> {
    if(id === null) return await AsyncStorage.removeItem(ACTIVE_MASTER_KEY_ID_KEY)
    await AsyncStorage.setItem(ACTIVE_MASTER_KEY_ID_KEY, id)
}

/**
 * Retrieves the currently active secret key. If no active key is set, returns the first available key,
 * or null if no keys are available.
 *
 * @return {Promise<SecretKey | null>} A promise resolving to the active secret key, the first available
 * secret key if no active key is set, or null if no keys are available.
 */
export async function getActiveSecretKey(): Promise<SecretKey | null> {
    const [pairs, activeId] = await Promise.all([getAllSecretKey(), getActiveSecretKeyId()])
    if (!activeId) return pairs.length > 0 ? pairs[0] : null
    return pairs.find((p) => p.id === activeId) || (pairs.length > 0 ? pairs[0] : null)
}


/**
 * Removes a secret key identified by the given ID from the stored secret key pairs.
 * If the removed key is the active secret key, the active key is updated to the first available key or null.
 *
 * @param {string} id - The ID of the secret key to be removed.
 * @return {Promise<void>} - A promise that resolves when the secret key has been removed.
 */
export async function removeSecretKey(id: string): Promise<void> {
    const pairs = await getAllSecretKey()
    const updatedPairs = pairs.filter(p => p.id !== id)
    await SecureStore.setItemAsync(MASTER_KEY_PAIRS_KEY, JSON.stringify(updatedPairs))
    if (id === await getActiveSecretKeyId()) {
        await setActiveSecretKeyId(updatedPairs[0]?.id || null)
    }
}
