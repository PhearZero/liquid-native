import AsyncStorage from "@react-native-async-storage/async-storage";
import {PROVIDERS_KEY} from "@/lib/provider";
import * as SecureStore from "expo-secure-store";
import {
    ACTIVE_MASTER_KEY_ID_KEY, ASSETS_KEY,
    MASTER_KEY_PAIRS_KEY,
    PREFERENCES_KEY,
    ROCCA_STATE_KEY,
    WALLETS_KEY
} from "@/lib";

export async function clearAll(): Promise<void> {
    await Promise.all([
        AsyncStorage.multiRemove([
            ROCCA_STATE_KEY,
            WALLETS_KEY,
            PROVIDERS_KEY,
            PREFERENCES_KEY,
            ACTIVE_MASTER_KEY_ID_KEY,
            ASSETS_KEY,
        ]),
        SecureStore.deleteItemAsync(MASTER_KEY_PAIRS_KEY),
    ])
}