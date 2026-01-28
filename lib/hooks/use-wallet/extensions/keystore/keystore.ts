import {BaseProvider} from "@/lib/hooks/use-wallet/types";
import type {KeyStore, SecretKey} from "@/lib/hooks/use-wallet/extensions/keystore/types";

const init = (provider: BaseProvider, options: any): KeyStore => {
    return {
        secrets: options.secrets || [] as SecretKey[],
        activeSecret: options.activeSecret || null as SecretKey | null,
        keystore: options.keystore || {
            secrets: [] as SecretKey[],
            add: async (name: string, increment: boolean, strength: number) => {throw new Error('Not Implemented')},
            remove: async (id: string) => {throw new Error('Not Implemented')},
            import: async (mnemonic: string, name: string = "Secret Key") => {throw new Error('Not Implemented')},
            export: async (id: string) => {throw new Error('Not Implemented')},
        },
    }
}

export default init;

// Implementation for Websites