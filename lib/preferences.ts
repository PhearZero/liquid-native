import AsyncStorage from "@react-native-async-storage/async-storage";

export const PREFERENCES_KEY = 'rocca_preferences'
export interface Preferences {
    feeCoverageEnabled: boolean
}
export async function getPreferences(): Promise<Preferences> {
    const value = await AsyncStorage.getItem(PREFERENCES_KEY)
    return value ? JSON.parse(value) : { feeCoverageEnabled: true }
}

export async function savePreferences(preferences: Preferences): Promise<void> {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}