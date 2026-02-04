import React, {createContext, type ReactNode} from 'react';
import {Provider, type BaseProvider, type Extension} from "@algorandfoundation/wallet-provider";

export const AlgorandContext = createContext<null | Provider<any>>(null);

export interface AlgorandProviderProps<E extends readonly Extension[]> {
    children: ReactNode
    provider: BaseProvider<E>
}
export function AlgorandProvider<E extends readonly Extension[]>({ children, provider }: AlgorandProviderProps<E>) {
    return (
        <AlgorandContext.Provider value={provider}>
            {children}
        </AlgorandContext.Provider>
    )
}