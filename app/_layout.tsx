import {Stack} from 'expo-router'
import {AlgorandProvider} from "@txnlab/use-wallet-react";
import {ReactNativeProvider} from "@perawallet/react-native-provider";
import {v4 as uuidv4} from 'uuid';



export default function RootLayout() {
  return (
      <AlgorandProvider provider={new ReactNativeProvider({
          id: uuidv4(),
          uri: new URL("https://debug.liquidauth.com"),
          name: "Liquid Native Wallet",
      }, {
          keystore: true,
          algorand:{
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
