/**
 * BeReal Constants Module - Contains constant values used by the BeReal API
 *
 * This module exports various constants needed for interacting with BeReal's API,
 * including API keys, client IDs, and configuration values.
 * It also provides header creation functions for API requests.
 *
 * @example
 * ```ts
 * import { BEREAL_DEFAULT_HEADERS } from "jsr:@lami/bereal-api";
 *
 * // Create default headers with a device ID
 * const headers = BEREAL_DEFAULT_HEADERS("your-device-id-here");
 * ```
 *
 * @module
 */
// References:
// - https://github.com/StayRealHQ/Universal/blob/main/src/api/constants.ts

import { decodeHex } from "@std/encoding";
import { createBeRealSignature } from "./utils.ts";

/** BeReal app bundle identifier */
export const BEREAL_APP_BUNDLE_ID = "AlexisBarreyat.BeReal";

/** BeReal app version */
export const BEREAL_APP_VERSION = "4.22.1";

/** BeReal app version code */
export const BEREAL_APP_VERSION_CODE = "20404";

/** User's current timezone */
export const BEREAL_TIMEZONE: string =
  new Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Arkose Labs public key used by BeReal */
export const BEREAL_ARKOSE_LABS_PUBLIC_KEY =
  "CCB0863E-D45D-42E9-A6C8-9E8544E8B17E";

/** reCAPTCHA site key used by BeReal */
export const BEREAL_RECAPTCHA_SITE_KEY =
  "6LfqjDgoAAAAAPy3wiCP92R3nDyNgDDIsjZACoVT";

/** HMAC key for BeReal signature generation */
export const BEREAL_HMAC_KEY = decodeHex(
  "3536303337663461663232666236393630663363643031346532656337316233"
);

/** Firebase API key used by BeReal */
export const BEREAL_FIREBASE_KEY = "AIzaSyCgNTZt6gzPMh-2voYXOvrt_UR_gpGl83Q";

/** BeReal client ID */
export const BEREAL_CLIENT_ID = "ios";

/** BeReal client secret */
export const BEREAL_CLIENT_SECRET = "962D357B-B134-4AB6-8F53-BEA2B7255420";

/** BeReal platform identifier */
export const BEREAL_PLATFORM = "iOS";

/** BeReal OS version */
export const BEREAL_OS_VERSION = "16.6";

/**
 * Type definition for extra headers that can be added to requests
 */
export type ExtraHeaders = {
  /** Authorization header */
  authorization?: string;
  /** BeReal user ID header */
  "bereal-user-id"?: string;
} & Record<string, string>;

/**
 * Creates default headers required for BeReal API requests
 *
 * @param deviceId - The device identifier to use in headers
 * @param extraHeaders - Optional additional headers to include
 * @returns Object containing all required headers for BeReal API requests
 */
export const BEREAL_DEFAULT_HEADERS = (
  deviceId: string,
  extraHeaders?: ExtraHeaders
): Record<string, string> => ({
  "bereal-signature": createBeRealSignature(deviceId),
  "user-agent": `BeReal/${BEREAL_APP_VERSION} (${BEREAL_APP_BUNDLE_ID}; build:${BEREAL_APP_VERSION_CODE}; ${BEREAL_PLATFORM} ${BEREAL_OS_VERSION}.0)`,
  "bereal-app-language": "en-US",
  "bereal-os-version": BEREAL_OS_VERSION,
  "bereal-app-version": BEREAL_APP_VERSION,
  "bereal-timezone": BEREAL_TIMEZONE,
  "bereal-platform": BEREAL_PLATFORM,
  "bereal-app-version-code": BEREAL_APP_VERSION_CODE,
  "bereal-device-language": "en",
  "accept-language": "en-US",
  "bereal-device-id": deviceId,
  ...extraHeaders,
});
