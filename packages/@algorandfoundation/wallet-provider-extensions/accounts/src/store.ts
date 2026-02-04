import type { Store } from '@tanstack/store'
import type {WalletAccount} from "./types.js";
export interface AccountStoreState {
    accounts: WalletAccount[],
    activeAccount: WalletAccount | null
}
export function addAccount(store: Store<AccountStoreState>, account: WalletAccount) {
    store.setState((state) => {
        return {
            accounts: [account, ...state.accounts],
            activeAccount: account,
        }
    })
}

export function removeAccount(store: Store<AccountStoreState>, accountId: string){
    store.setState((state) => {
        return {
            accounts: state.accounts.filter((account) => account.id !== accountId),
            activeAccount: accountId === state.activeAccount?.id ? null : state.activeAccount
        }
    })
}

export function getAccount(store: Store<AccountStoreState>, accountId: string){
    return store.state.accounts.find((secret) => secret.id === accountId)
}

export async function getAccountsBySecretKeyId(store: Store<AccountStoreState>, secretKeyId: string): Promise<WalletAccount[]> {
    return store.state.accounts.filter((w) => w.secretKeyId === secretKeyId)
}