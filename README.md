# BeReal API

A TypeScript library for interacting with BeReal's internal APIs. Available for Deno, Node.js, and other JavaScript runtimes via JSR.

[![jsr](https://jsr.io/badges/@lami/bereal-api)](https://jsr.io/@lami/bereal-api)

## Overview

This library provides a wrapper for the unofficial APIs used by the BeReal app, making it easy to interact with BeReal services from TypeScript. With this library, you can authenticate, retrieve friend information, create and retrieve posts, and access other BeReal features programmatically.

## Installation

### Package Managers

#### NPM / PNPM / Yarn
```bash
# NPM
npx jsr add @lami/bereal-api

# PNPM
pnpm i jsr:@lami/bereal-api

# Yarn
yarn add jsr:@lami/bereal-api
```

#### Deno
```bash
deno add jsr:@lami/bereal-api
```

#### Bun
```bash
bunx jsr add @lami/bereal-api
```

### Import

```typescript
// Import from JSR
import { BeReal, BeRealAuth, BeRealAuthVonage } from "jsr:@lami/bereal-api";
```

## Usage

```typescript
import { BeReal } from "jsr:@lami/bereal-api";

// Initialize BeReal client
const client = new BeReal(accessToken);

// API usage example
const feedsFriendsV1 = await client.getFeedsFriendsV1();
```

## Key Features

- Complete BeReal authentication flow via phone number verification
- Friend information and request management
- Post creation and retrieval
- Feed access (friends and discovery)
- Profile management
- Comment and reaction functionality
- Cross-platform compatibility
- TypeScript type definitions

## Acknowledgements

The method for generating the BeReal signature was referenced from:
- [StayRealHQ/Universal](https://github.com/StayRealHQ/Universal)

## Disclaimer

This library was created for research and educational purposes only. It is not affiliated with, authorized by, endorsed by, or in any way officially connected with BeReal. Please respect BeReal's terms of service when using this library.

BeReal's API is unofficial and undocumented, so it may change at any time without notice, which could cause this library to stop functioning correctly.

## License

GPL-3.0