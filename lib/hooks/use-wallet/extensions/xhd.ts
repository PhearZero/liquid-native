import {Provider, Extension} from "@/lib/hooks/use-wallet/types";
import {XHDWalletAPI} from "@algorandfoundation/xhd-wallet-api";

export const xhd = new XHDWalletAPI()
export const WithXHD: Extension = (provider: Provider, options: any) => {
    if(typeof provider.options.accounts === "undefined" && (options.xhd && typeof options.xhd.accounts !== "undefined" && options.xhd.accounts !== null && options.xhd.accounts !== false)) {
        // Handle loading of the accounts from the xhd wallet
        (provider as any).accounts = options.xhd.accounts;
    }
    return {
        encrypt: options.encrypt || null,
        decrypt: options.decrypt || null,
    }
}
export default WithXHD;