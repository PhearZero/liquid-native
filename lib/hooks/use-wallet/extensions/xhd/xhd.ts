import {Provider, Extension} from "@/lib/hooks/use-wallet/types";

export const WithXHD: Extension = (provider: Provider, options: any) => {
    if(typeof provider.options.accounts === "undefined" && (options.xhd && typeof options.xhd.accounts !== "undefined" && options.xhd.accounts !== null && options.xhd.accounts !== false)) {
        // Handle loading of the accounts from the xhd wallet
        // ts-expect-error: accounts is not defined on the provider, TODO: update types to support inference
        (provider as any).accounts = options.xhd.accounts;
    }
    return {
        // TODO: these should be interfaces to the library with the key paths and type of operation
        encrypt: options.encrypt || null,
        decrypt: options.decrypt || null,
    }
}
export default WithXHD;