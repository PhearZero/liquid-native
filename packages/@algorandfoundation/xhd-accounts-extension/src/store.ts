import type { Store } from '@tanstack/store'
import type { WalletAccount } from "@algorandfoundation/accounts-extension";
export interface AccountStoreState {
    accounts: WalletAccount[],
    activeAccount: WalletAccount | null
}

export function addWallet(store: Store<AccountStoreState>, wallet: WalletAccount) {
    store.setState((state) => {
        return {
            accounts: [wallet, ...state.accounts],
            activeAccount: wallet
        }
    })
}

export function removeWallet(store: Store<AccountStoreState>, walletId: string){
    store.setState((state) => {
        return {
            accounts: state.accounts.filter((account) => account.id !== walletId),
            activeAccount: walletId === state.activeAccount?.id ? null : state.activeAccount
        }
    })
}

export function getWallet(store: Store<AccountStoreState>, walletId: string){
    return store.state.accounts.find((secret) => secret.id === walletId)
}