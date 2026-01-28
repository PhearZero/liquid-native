# Liquid Wallet Requirements

## Overview

Liquid Wallet is a hybrid decentralized identity solution that combines the interoperability of OpenID Connect for Verifiable Credentials (OIDC4VC) with the security and transparency of the Algorand blockchain. This document outlines the core requirements for the Liquid Wallet application.

## Main Features

### 1. Asset Management (Algorand)

The wallet must provide comprehensive management for Algorand-specific tokens (ASAs - Algorand Standard Assets).

- **Onboarding Process:**
  - A dedicated onboarding flow for first-time users.
  - Automatic configuration of the wallet upon first launch.
  - Generation and secure storage of cryptographic keys.
- **Token Operations:**
  - Ability to view, send, and receive Algorand and ASAs.
  - Support for opting into assets.
- **Fee Coverage:**
  - Implementation of fee coverage mechanisms for required transactions.
  - Ensure a smooth user experience where users do not necessarily need to hold ALGO for initial or specific transaction fees.

### 2. Identity Management (OIDC4VC)

The wallet must support decentralized identity management using the OIDC4VC standard.

- **Unified Key Management:**
  - Leverage the same cryptographic key management system used for Algorand asset management.
  - Ensure consistent security practices across both asset and identity features.
- **Credential Lifecycle:**
  - Support for issuing, storing, and presenting Verifiable Credentials (VCs).
  - Compliance with OIDC4VC protocols for seamless interaction with identity providers and relying parties.

### 3. Service Providers

The wallet must allow users to configure and manage various service providers to tailor their experience and connectivity.

- **DID Resolvers:**
  - User-specifiable DID resolvers to handle various Decentralized Identifier methods.
- **Algorand Nodes:**
  - Configuration of Algorand node endpoints (Mainnet, Testnet, or private nodes).
  - Support for switching between different network environments.
- **OIDC4VC Providers:**
  - Ability to specify and manage supported OIDC4VC providers (Issuers and Verifiers).
