// References:
// - https://github.com/StayRealHQ/Universal/blob/main/src/api/core/signature.ts

/// <reference types="npm:@types/node" />
import { BEREAL_HMAC_KEY, BEREAL_TIMEZONE } from "./constants.ts";
import { createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { encodeBase64 } from "@std/encoding";

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
