/**
 * BeReal API - A TypeScript library for interacting with BeReal's internal APIs
 * 
 * This module exports classes and functions that make it easy to use the unofficial
 * API used by the BeReal app. You can access key BeReal features such as authentication,
 * retrieving friend information, creating and retrieving posts, and more.
 * 
 * @example
 * ```ts
 * import { BeReal } from "jsr:@lami/bereal-api";
 * 
 * // Initialize BeReal client
 * const client = new BeReal(accessToken);
 * 
 * // Get friends feed
 * const feedsFriends = await client.getFeedsFriendsV1();
 * console.log(feedsFriends);
 * ```
 * 
 * @module
 */
import { BeRealAuthVonage, BeRealAuth } from "./auth-l7.ts";
import {
  BeReal,
  BeRealError,
  BeRealAccessTokenExpiredError,
} from "./mobile-l7.ts";
import {
  BEREAL_DEFAULT_HEADERS,
  BEREAL_ARKOSE_LABS_PUBLIC_KEY,
  BEREAL_RECAPTCHA_SITE_KEY,
  BEREAL_CLIENT_ID,
  BEREAL_CLIENT_SECRET,
} from "./constants.ts";
import {
  createBeRealSignature,
  parseAccessToken,
  isAccessTokenExpired,
} from "./utils.ts";

export {
  BeRealAuthVonage,
  BeRealAuth,
  BeReal,
  BeRealError,
  BeRealAccessTokenExpiredError,
  BEREAL_DEFAULT_HEADERS,
  BEREAL_ARKOSE_LABS_PUBLIC_KEY,
  BEREAL_RECAPTCHA_SITE_KEY,
  BEREAL_CLIENT_ID,
  BEREAL_CLIENT_SECRET,
  createBeRealSignature,
  parseAccessToken,
  isAccessTokenExpired,
};
