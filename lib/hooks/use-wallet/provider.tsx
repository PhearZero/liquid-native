import {createContext, ReactNode} from 'react';
import {BaseProvider, Extension} from "@/lib/hooks/use-wallet/types";

export const AlgorandContext = createContext<null | BaseProvider>(null);

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