import {Provider} from "@/lib/hooks/use-wallet/types";

export default function WithIntermezzo(provider: Provider, options: any) {
    return {
        intermezzo: options.intermezzo || false, // Would provide the API access information
        liquid: options.liquid || {/* Default Liquid Auth Options*/}, // Other extensions could be loaded by default
        // Manager operations could be included that have access to this.accounts
    }
}
