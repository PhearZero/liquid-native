import type {AccountStoreState} from "./store.js";

export interface WalletAccount {
    id: string
    name: string
    address: string
    type: 'XHD' | 'Algorand' | 'Intermezzo' | string
    secretKeyId?: string // Link to the key it relates to, undefined when it belongs to a third party or is not managed by the provider (ie use-wallet)
    providerId?: string // Link to the provider who holds the wallet, this is usually an origin or well-known UUID. (used heavily in providers without keystores who rely on an intermediary for communication ie use-wallet)
    metadata?: Record<string, any> // Extra wallet metadata
}

export interface AccountsExtension extends AccountStoreState {
    accounts: WalletAccount[]
    activeAccount: WalletAccount | null

    wallet: {
        store: AccountsApi
        // Other wallets will have their own extensions here that modify the store.
    }
}
export interface AccountsApi {
    add: (wallet: WalletAccount) => Promise<WalletAccount>
    remove: (id: string) => Promise<void>
    setActiveAccount: (account: WalletAccount | null) => void
}