// References:
// - https://github.com/StayRealHQ/Universal/blob/main/src/api/core/signature.ts

/// <reference types="npm:@types/node" />
import { BEREAL_HMAC_KEY, BEREAL_TIMEZONE } from "./constants.ts";
import { createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { decodeBase64, encodeBase64 } from "@std/encoding";

export function createBeRealSignature(
  deviceId: string,
  timestamp = Math.floor(Date.now() / 1000)
): string {
  const payload = `${deviceId}${BEREAL_TIMEZONE}${timestamp}`;

  const hmac = createHmac("sha256", BEREAL_HMAC_KEY);
  hmac.update(encodeBase64(payload), "utf8");
  const hashBuffer = hmac.digest();

  const prefixBuffer = Buffer.from(`1:${timestamp}:`, "utf8");

  const combined = Buffer.concat([prefixBuffer, hashBuffer]);

  return encodeBase64(combined);
}

export type AccessTokenHeader = {
  alg: string;
  typ: string;
};

export type AccessTokenPayload = {
  uid: string;
  user_id: string;
  phone_number_country_code: string;
  iss: string;
  aud: string;
  impersonated_by: null | unknown;
  iat: number;
  exp: number;
};

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

export function isAccessTokenExpired(token: string): boolean {
  const { payload } = parseAccessToken(token);
  return payload.exp < Math.floor(Date.now() / 1000);
}
