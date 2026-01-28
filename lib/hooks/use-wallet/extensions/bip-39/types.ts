import {SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";

export interface BIP39Extension {
    add?: (name: string, increment: boolean, strength: number) => Promise<void>
    remove?: (id: string) => Promise<void>
    import?: (mnemonic: string, name?: string) => Promise<void>
    export?: (id: string) => Promise<string | undefined>
    generate: (name?: string, increment?: boolean, strength?: number) => Promise<SecretKey>
}

export interface BIP39 {
    bip39: BIP39Extension
}