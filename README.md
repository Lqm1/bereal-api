# bereal-api

A thin API wrapper library for interacting with BeReal's internal APIs using TypeScript. Available on Deno and JSR.

[![jsr](https://jsr.io/badges/@lami/bereal-api)](https://jsr.io/@lami/bereal-api)

## Overview

This library provides a wrapper to easily use the unofficial APIs used by the BeReal app from TypeScript.

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
deno add jsr:bereal-api
```

#### Bun
```bash
bunx jsr add @lami/bereal-api
```

### Import

```bash
# Import from JSR
import { BeReal } from "jsr:@lami/bereal-api";
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

- BeReal authentication (phone number authentication)
- Friend information retrieval
- Post retrieval and creation
- Access to other BeReal API features

## Acknowledgements

The method for generating the BeReal signature was referenced from the following project:
- [StayRealHQ/Universal](https://github.com/StayRealHQ/Universal)

## Disclaimer

This library was created for research purposes and is not based on official BeReal API documentation. Please do not use this library in ways that violate BeReal's terms of service.

The developer assumes no responsibility for any issues or damages arising from the use of this library. BeReal's API may change without notice, which could cause this library to stop functioning.

## License

GPL-3.0