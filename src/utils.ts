/**
 * BeReal Utilities Module - Helper functions for working with BeReal's API
 *
 * This module provides utility functions for generating signatures, parsing tokens,
 * and other helper functions required for BeReal API interactions.
 *
 * @example
 * ```ts
 * import { createBeRealSignature, parseAccessToken } from "jsr:@lami/bereal-api";
 *
 * // Generate a BeReal API signature
 * const signature = createBeRealSignature("your-device-id");
 *
 * // Parse an access token to get user ID and expiration
 * const { payload: { user_id, exp } } = parseAccessToken("access-token-here");
 * ```
 *
 * @module
 */
// References:
// - https://github.com/StayRealHQ/Universal/blob/main/src/api/core/signature.ts

/// <reference types="npm:@types/node@22.12.0" />
import { BEREAL_HMAC_KEY, BEREAL_TIMEZONE } from "./constants.ts";
import { createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { decodeBase64, encodeBase64 } from "@std/encoding";

/**
 * Creates a BeReal signature required for API authentication
 *
 * This function generates the HMAC-based signature required by BeReal's API
 * for request authentication. It combines the device ID, timezone, and timestamp.
 *
 * @param deviceId - The unique device identifier
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns The BeReal signature string
 */
export function createBeRealSignature(
  deviceId: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): string {
  const payload = `${deviceId}${BEREAL_TIMEZONE}${timestamp}`;

  const hmac = createHmac("sha256", BEREAL_HMAC_KEY);
  hmac.update(encodeBase64(payload), "utf8");
  const hashBuffer = hmac.digest();

  const prefixBuffer = Buffer.from(`1:${timestamp}:`, "utf8");

  const combined = Buffer.concat([prefixBuffer, hashBuffer]);

  return encodeBase64(combined);
}

/**
 * JWT header of a BeReal access token
 */
export type AccessTokenHeader = {
  /** Algorithm used for the token */
  alg: string;
  /** Type of token */
  typ: string;
};

/**
 * Payload of a BeReal access token
 */
export type AccessTokenPayload = {
  /** User identifier */
  uid: string;
  /** User identifier (duplicate) */
  user_id: string;
  /** Phone number country code */
  phone_number_country_code: string;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string;
  /** Impersonation information (if any) */
  impersonated_by: null | unknown;
  /** Token issued at timestamp */
  iat: number;
  /** Token expiration timestamp */
  exp: number;
};

/**
 * Parses a BeReal access token into its components
 *
 * @param token - The JWT token to parse
 * @returns Object containing the token header and payload
 */
export function parseAccessToken(token: string): {
  header: AccessTokenHeader;
  payload: AccessTokenPayload;
} {
  const jwtHeader = JSON.parse(
    new TextDecoder().decode(decodeBase64(token.split(".")[0]))
  );
  const jwtPayload = JSON.parse(
    new TextDecoder().decode(decodeBase64(token.split(".")[1]))
  );
  return {
    header: jwtHeader,
    payload: jwtPayload,
  };
}

/**
 * Checks if a BeReal access token has expired
 *
 * @param token - The JWT token to check
 * @returns True if the token has expired, false otherwise
 */
export function isAccessTokenExpired(token: string): boolean {
  const { payload } = parseAccessToken(token);
  return payload.exp < Math.floor(Date.now() / 1000);
}
