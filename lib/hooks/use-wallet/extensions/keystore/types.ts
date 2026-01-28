export interface SecretKey {
    id: string
    name: string
    value: string
    type: 'bip39' | 'intermezzo' | 'pera' // Could be any certificate material like x502
}

export interface KeyStoreExtension {
    add: (name?: string, increment?: boolean, strength?: number) => Promise<void>
    remove: (id: string) => Promise<void>
    import: (value: string, name?: string) => Promise<void>
    export: (id: string) => Promise<string | undefined>
}

export interface KeyStore {
    secrets: SecretKey[],
    activeSecret: SecretKey | null,
    keystore: KeyStoreExtension
}