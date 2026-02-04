import * as SecureStore from "expo-secure-store";

// Base Provider type
import type {BaseProvider, ExtensionOptions} from "@algorandfoundation/wallet-provider";
import type {KeyStoreExtension, KeyStoreApi, SecretKey} from "@algorandfoundation/keystore-extension";
import {addSecret, removeSecret} from "./store.js";
import { Store } from "@tanstack/store";
export const SECRET_KEYS_ITEM = 'pera_secrets'


type ReactNativeContext = BaseProvider & KeyStoreExtension & {$secrets: Store<SecretKey[]>}

/**
 * Initializes a KeyStore instance with the provided provider and options.
 *
 * This provides the basic interface for handling key material.
 * This example is concise and demonstrates a basic keystore that produces bip39 mnemonic phrases.
 *
 */
export const init = (provider: ReactNativeContext, options: Omit<ExtensionOptions, 'keystore'> & {keystore?: KeyStoreApi}): KeyStoreExtension & {$secrets: Store<SecretKey[]>} => ({
    // TODO: convert to Reflective Store - zustand or tanstack (Pera vs TxnLab discussion)
    // TODO: LifeCycle and Description - https://www.npmjs.com/package/before-after-hook
    secrets: [],
    $secrets: new Store<SecretKey[]>([]),
    keystore: provider.keystore || {
        add: async (key: SecretKey) => await saveSecretKey(provider, key),
        remove: async (id: string) => await removeSecretKey(provider, id),
        import: async (key: SecretKey) => await saveSecretKey(provider, key),
        export: async (id: string) => await getSecretKeyById(id),
        clear: async () => await clearAll(provider)
    } as KeyStoreApi & {clear: () => Promise<void>},
})


export const bootstrap = (provider: ReactNativeContext, options: ExtensionOptions): void => {
    console.log('@perawallet/react-native-keystore - bootstrap')
}


// Implementation for React Native
// TODO: Allow for isomorphism in the future, disparity between Lute and Pera keystores should be investigated.
// NOTE: Assume WebCrypto will be available widely in the future in all contexts which will provide the isomorphism and
// consolidate this library into a single extension.
//
// This implementation is a concise example for React Native which illustrates the Provider/Extension relationship.
// It is responsible for mutating it's own store and that is the limits of it's responsibility.
// All other functionality is built on top of this model.


/**
 * Saves a new secret key to secure storage if it does not already exist.
 *
 * @param provider
 * @param {SecretKey} key - The secret key object to be saved. Must have a unique identifier.
 * @return {Promise<SecretKey>} A promise that resolves to the saved secret key object.
 * @throws {Error} If a key with the same identifier already exists.
 */
export async function saveSecretKey(provider: ReactNativeContext, key: SecretKey): Promise<SecretKey> {
    if(typeof key === 'undefined') throw new TypeError('Key must be defined')
    console.log('@perawallet/react-native-keystore - saveSecretKey', key)

    const pairs = await getAllSecretKey()

    const index = pairs.findIndex((p) => p.id === key.id)

    if (index >= 0) {
        throw new Error('Key already exists')
    } else {
        pairs.push(key)
    }

    // Store item
    await SecureStore.setItemAsync(SECRET_KEYS_ITEM, JSON.stringify(pairs))

    // Merge states
    provider.secrets.push(key)
    addSecret(provider.$secrets, key)

    return key
}

/**
 * Retrieves all secret keys stored in the secure storage.
 *
 * @return {Promise<SecretKey[]>} A promise that resolves to an array of secret keys.
 * If no keys are found, it returns an empty array.
 */
export async function getAllSecretKey(): Promise<SecretKey[]> {
    console.log('@perawallet/react-native-keystore - getAllSecretKey')
    const value = await SecureStore.getItemAsync(SECRET_KEYS_ITEM)
    return value ? JSON.parse(value) : []
}

/**
 * Retrieves a secret key based on an existing ID.
 *
 * @param {string} id - The unique identifier of the secret key to retrieve.
 * @return {Promise<SecretKey|null>} A promise that resolves to the secret key object if found, or null if no matching key is found.
 */
export async function getSecretKeyById(id: string): Promise<SecretKey | null> {
    console.log('@perawallet/react-native-keystore - getSecretKeyById', id)
    const pairs = await getAllSecretKey()
    return pairs.find((p) => p.id === id) || null
}

/**
 * Removes a secret key identified by the given ID from the stored secret key pairs.
 *
 * @param provider
 * @param {string} id - The ID of the secret key to be removed.
 * @return {Promise<void>} - A promise that resolves when the secret key has been removed.
 */
export async function removeSecretKey(provider: ReactNativeContext, id: string): Promise<void> {
    console.log('@perawallet/react-native-keystore - removeSecretKey', id)
    const pairs = await getAllSecretKey()
    const updatedPairs = pairs.filter(p => p.id !== id)
    await SecureStore.setItemAsync(SECRET_KEYS_ITEM, JSON.stringify(updatedPairs))
    removeSecret(provider.$secrets, id)
}

export async function clearAll(provider: ReactNativeContext) {
    await SecureStore.deleteItemAsync(SECRET_KEYS_ITEM)
    provider.$secrets.setState([])
    provider.secrets = []
}