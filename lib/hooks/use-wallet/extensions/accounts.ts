// Use Wallet Becomes a "Type of Provider" for any wallet that handles accounts
import {Provider} from "@/lib/hooks/use-wallet/types";


export default async function init(provider: Provider, options: any) {
    // TODO: Check current configuration for more introspection.
    // This could be adding metadata from xhd, intermezzo, pera, etc
    // provider.EXTENSIONS.includes(SomeExtension)
    return {
        accounts: options.accounts || [],
        activeAccount: options.activeAccount || null,
    }
}