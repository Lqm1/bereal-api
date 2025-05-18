// References:
// - https://github.com/StayRealHQ/Universal/blob/main/src/api/constants.ts

import { decodeHex } from "@std/encoding";
import { createBeRealSignature } from "./utils.ts";

export const BEREAL_APP_BUNDLE_ID = "AlexisBarreyat.BeReal";
export const BEREAL_APP_VERSION = "4.22.1";
export const BEREAL_APP_VERSION_CODE = "20404";
export const BEREAL_TIMEZONE = new Intl.DateTimeFormat().resolvedOptions()
  .timeZone;
export const BEREAL_ARKOSE_PUBLIC_KEY = "CCB0863E-D45D-42E9-A6C8-9E8544E8B17E";
export const BEREAL_HMAC_KEY = decodeHex(
  "3536303337663461663232666236393630663363643031346532656337316233"
);
export const BEREAL_FIREBASE_KEY = "AIzaSyCgNTZt6gzPMh-2voYXOvrt_UR_gpGl83Q";
export const BEREAL_CLIENT_ID = "ios";
export const BEREAL_CLIENT_SECRET = "962D357B-B134-4AB6-8F53-BEA2B7255420";

export const BEREAL_PLATFORM = "iOS";
export const BEREAL_OS_VERSION = "16.6";

export type ExtraHeaders = {
  authorization?: string;
  "bereal-user-id"?: string;
} & Record<string, string | number>;

export const BEREAL_DEFAULT_HEADERS = (
  deviceId: string,
  extraHeaders?: ExtraHeaders
) => ({
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
