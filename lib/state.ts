import AsyncStorage from '@react-native-async-storage/async-storage'

// TODO: Refactor to more robust solution like zustand/tanstack stores for app state
export const ROCCA_STATE_KEY = 'rocca_state'

export async function isOnboarded(): Promise<boolean> {
    const value = await AsyncStorage.getItem(ROCCA_STATE_KEY)
    return value === 'true'
}

export async function setOnboarded(status: boolean): Promise<void> {
    await AsyncStorage.setItem(ROCCA_STATE_KEY, status.toString())
}
