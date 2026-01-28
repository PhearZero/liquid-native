import {Provider} from "@/lib/hooks/use-wallet/types";

export default function WithPasskeys(provider: Provider, options: any) {
    return {
        passkeys: options.passkeys || [],
        activePasskey: options.activePasskey || null,
    }
}
