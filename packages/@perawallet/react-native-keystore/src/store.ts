// TODO: Wire this up in the AM

import type { Store } from '@tanstack/store'
import type {SecretKey} from "@algorandfoundation/keystore-extension";

export function addSecret(store: Store<SecretKey[]>, secret: SecretKey) {
    store.setState((state) => {
        return [secret, ...state]
    })
}

export function removeSecret(store: Store<SecretKey[]>, secretKeyId: string){
    store.setState((state) => {
        return state.filter((secret) => secret.id !== secretKeyId)
    })
}

export function getSecret(store: Store<SecretKey[]>, secretKeyId: string){
    return store.state.find((secret) => secret.id === secretKeyId)
}

export function clearSecrets(store: Store<SecretKey[]>){
    store.setState([])
}