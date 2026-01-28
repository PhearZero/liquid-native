import {Stack} from 'expo-router'
import {AlgorandProvider} from "@/lib/hooks/use-wallet/provider";
import {ReactNativeProvider} from "@/lib/hooks/use-wallet/providers/ReactNativeProvider";
import {ProviderId} from "@/lib/hooks/use-wallet/types";

export default function RootLayout() {
  return (
      <AlgorandProvider provider={new ReactNativeProvider({
          id: ProviderId.ALGORAND_PROVIDER,
          url: new URL("https://debug.liquidauth.com"),
          name: "Liquid Native Wallet",
          type: 'provider',
      }, {
          algorand: {
              algod: {
                  token: '',
                  server: 'https://testnet-api.4160.nodely.dev',
                  port: 443
              },
              indexer: {
                  token: '',
                  server: 'https://testnet-idx.4160.nodely.dev',
                  port: 443
              }
          }
      })}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/setup" options={{ title: 'Setup' }} />
          <Stack.Screen name="(main)/home" options={{ headerShown: false }} />
          <Stack.Screen name="(main)/settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="account/[address]" options={{ title: 'Assets' }} />
          <Stack.Screen name="connect" options={{ title: 'Connect', headerShown: false }} />
        </Stack>
      </AlgorandProvider>
  )
}
