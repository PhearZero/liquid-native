# Liquid Wallet

> [!WARNING]
> This project is currently in development and not officially released or supported, just for illustration purposes.

See [discovery](./DISCOVERY.md) for more information.

## Overview

Liquid Native is a hybrid decentralized identity solution that combines the interoperability of OpenID Connect for
Verifiable Credentials (OIDC4VC) with the security and transparency of the Algorand blockchain. This architecture
enables users to manage their digital identities through standards-based credential exchange while leveraging Algorand's
high-performance blockchain for state management and transaction recording.

### Key Features

- **OIDC4VC Integration**: Implements OpenID Connect for Verifiable Credentials protocol, enabling seamless credential
  issuance and verification with existing identity providers and relying parties
- **Algorand Blockchain Backend**: Utilizes Algorand's layer-1 blockchain for:
   - Immutable credential state tracking and revocation management
   - Transaction recording with instant finality and low fees
   - Decentralized identifier (DID) resolution and management
   - Smart contract-based credential schemas and verification policies
- **Hybrid Architecture**: Combines off-chain credential presentation (for privacy) with on-chain state anchoring (for
  verifiability)
- **Cross-Platform Support**: Built with Expo/React Native for iOS, Android, and web platforms
- **Self-Sovereign Identity**: Users maintain full control over their credentials and identity data

## Get started

1. Install dependencies

> [!NOTE]
> - You must have [Node.js](https://nodejs.org/en/) installed on your machine.
> - Follow the instructions for https://www.npmjs.com/package/canvas
> - Ensure you are running on Java 17 

   ```bash
   sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
   ```
   
   ```bash
   npm install typescript -g && npm install
   ```

2. Start the app

   ```bash
   npm start
   ```
