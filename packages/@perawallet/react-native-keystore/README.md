# @perawallet/react-native-keystore

> [!NOTE]
> This package is currently in development and is subject to change. 
> The author claims no ownship over the Pera name or brand.

A React Native extension for the `@algorandfoundation/wallet-provider` that provides secure storage and management of cryptographic secrets, such as mnemonic phrases, API keys, and other sensitive data. This package leverages `expo-secure-store` and `@react-native-async-storage/async-storage` to handle sensitive information robustly and securely within React Native applications.

## Features

- **Secure Storage**: Uses native secure storage (Keychain on iOS, Keystore on Android) via `expo-secure-store`.
- **Multiple Secret Types**: Supports various secret formats including `algo25` (Algorand 25-word mnemonic), `bip39` (standard mnemonic), and others.
- **Provider Extension**: Seamlessly integrates with `@algorandfoundation/wallet-provider` to augment it with keystore capabilities.
- **Key Management**: Simple API for adding, removing, importing, and exporting secret keys.

### Future Plans

This extension is a candidate for inclusion in the `@algorandfoundation/wallet-provider-extensions` package.
Work will be performed in a branch of the Pera Wallet repository to integrate this extension into the pera wallet codebase.

## Installation

```bash
npm install @algorandfoundation/wallet-provider @perawallet/react-native-keystore
```

## Usage

Integrating the keystore extension into your wallet provider:

```typescript
import { Provider } from "@algorandfoundation/wallet-provider";
import WithKeyStore from "@perawallet/react-native-keystore";

const MyWalletProvider = Provider.withExtensions([WithKeyStore]);

const provider = new MyWalletProvider({
  id: "my-wallet",
  name: "My Wallet"
});

// Now you can access the keystore API on the provider
const secret = await provider.keystore.add({
  id: "my-key-id",
  name: "My Main Key",
  value: "your-mnemonic-phrase-here",
  type: "algo25"
});
```

Accessing the keystore API from a React component:

```jsx
import { useWallet } from "@txnlab/use-wallet-react";

<UseWallet provider={provider}>...</UseWallet>;
const { keystore } = useWallet();
```

## API

The extension adds a `keystore` object to the provider with the following methods:

### `add(key: SecretKey): Promise<SecretKey>`
Adds or updates a secret key in the secure storage.

### `remove(id: string): Promise<void>`
Removes the secret key with the specified ID.

### `import(key: SecretKey): Promise<SecretKey>`
Imports a new secret key.

### `export(id: string): Promise<string>`
Retrieves the raw secret value for the specified ID.

## Types

### `SecretKey`
```typescript
interface SecretKey {
  id: string;
  name: string;
  value: string;
  type: 'algo25' | 'bip39' | 'intermezzo' | 'pera' | string;
  metadata?: Record<string, any>;
}
```
