/**
 * BeReal Mobile API Module - Core client for interacting with BeReal's mobile API endpoints
 * 
 * This module provides the main BeReal client class for accessing BeReal's API features 
 * including retrieving feeds, friend data, posting content, and other core functionality.
 * It also includes error classes for handling BeReal-specific errors.
 * 
 * @example
 * ```ts
 * import { BeReal } from "jsr:@lami/bereal-api";
 * 
 * // Initialize client with access token
 * const client = new BeReal("your-access-token");
 * 
 * // Get friends feed
 * const feed = await client.getFeedsFriendsV1();
 * console.log(feed.posts);
 * 
 * // Get me
 * const me = await client.getPersonMe();
 * ```
 * 
 * @module
 */
import ky, { type KyInstance } from "ky";
import { BEREAL_DEFAULT_HEADERS, type ExtraHeaders } from "./constants.ts";
import {
  createBeRealSignature,
  type AccessTokenPayload,
  parseAccessToken,
} from "./utils.ts";

/**
 * Base error class for all BeReal-related errors
 */
export class BeRealError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BeRealError";
  }
}

/**
 * Error thrown when the access token has expired
 */
export class BeRealAccessTokenExpiredError extends BeRealError {
  constructor() {
    super("Access token expired");
    this.name = "BeRealAccessTokenExpiredError";
  }
}

/**
 * Main BeReal client class for interacting with BeReal's API
 * 
 * This class provides methods for accessing BeReal features such as feeds,
 * friends, posts, comments, and more. It requires a valid access token.
 */
export class BeReal {
  private client: KyInstance;
  private accessTokenPayload: AccessTokenPayload;
  private _accessToken: string;
  private _userId: string;
  private readonly deviceId: string;
  /**
   * Creates a new BeReal client instance
   * 
   * @param accessToken - A valid BeReal access token
   * @param deviceId - A unique device identifier 
   * @param extraHeaders - Optional additional headers for API requests
   * @throws {BeRealAccessTokenExpiredError} If the access token has expired
   */
  constructor(
    accessToken: string,
    deviceId: string,
    extraHeaders?: ExtraHeaders
  ) {
    const { payload: accessTokenPayload } = parseAccessToken(accessToken);
    this.accessTokenPayload = accessTokenPayload;
    if (this.accessTokenPayload.exp * 1000 < Date.now()) {
      throw new BeRealAccessTokenExpiredError();
    }
    this._accessToken = accessToken;
    this._userId = this.accessTokenPayload.user_id;
    this.deviceId = deviceId;
    this.client = ky.extend({
      prefixUrl: "https://mobile-l7.bereal.com/api",
      headers: BEREAL_DEFAULT_HEADERS(deviceId, {
        authorization: `Bearer ${accessToken}`,
        "bereal-user-id": this._userId,
        ...extraHeaders,
      }),
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.set(
              "bereal-signature",
              createBeRealSignature(this.deviceId)
            );
          },
        ],
      },
    });
  }

  set accessToken(token: string) {
    const { payload: accessTokenPayload } = parseAccessToken(token);
    this.accessTokenPayload = accessTokenPayload;
    if (this.accessTokenPayload.exp * 1000 < Date.now()) {
      throw new BeRealAccessTokenExpiredError();
    }
    this._accessToken = token;
    this._userId = this.accessTokenPayload.user_id;
    this.client = this.client.extend({
      headers: {
        authorization: `Bearer ${token}`,
        "bereal-user-id": this._userId,
      },
    });
  }

  get accessToken() {
    return this._accessToken;
  }

  get userId() {
    return this._userId;
  }

  get accessTokenPhoneNumberCountryCode() {
    return this.accessTokenPayload.phone_number_country_code;
  }

  get accessTokenExpiresAt() {
    return new Date(this.accessTokenPayload.exp * 1000);
  }

  isAccessTokenExpired() {
    return this.accessTokenExpiresAt < new Date();
  }

  async getTerms() {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get("terms");
    return response.json<{
      data: Array<{
        code: string;
        status: string;
        signedAt?: string;
        termUrl: string;
        version: string;
      }>;
    }>();
  }

  async getPersonMe() {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get("person/me");
    return response.json<{
      id: string;
      username: string;
      birthdate: string;
      fullname: string;
      profilePicture?: {
        url: string;
        width: number;
        height: number;
      };
      realmojis: Array<{
        emoji: string;
        media: {
          url: string;
          width: number;
          height: number;
        };
      }>;
      devices: Array<{
        clientVersion: string;
        device: string;
        deviceId: string;
        platform: string;
        language: string;
        timezone: string;
      }>;
      canDeletePost: boolean;
      canPost: boolean;
      canUpdateRegion: boolean;
      phoneNumber: string;
      countryCode: string;
      region: string;
      createdAt: string;
      isRealPeople: boolean;
      userFreshness: string;
      streakLength: number;
      type: string;
      links: Array<unknown>;
      customRealmoji: string;
      gender: string;
      isPrivate: boolean;
      lastActiveAt: string;
      previousLastActiveAt: string;
      lastPostAt: string;
    }>();
  }

  async getSettings() {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get("settings");
    return response.json<{
      mandatoryVersions: {
        ios: string;
        android: string;
      };
      recommendedVersions: {
        ios: string;
        android: string;
      };
      storage: {
        bucket: string;
      };
      polling: {
        feedsFriends: number;
        jitterPercent: number;
        moment: number;
      };
      officialAccounts: {
        maxFollows: number;
        maxNotifications: number;
      };
      bts: {
        maxLength: number;
      };
      cdn: {
        "cdn.bereal.network": Array<{
          domain: string;
          weight: number;
        }>;
        "cdn-cf.bereal.network": Array<{
          domain: string;
          weight: number;
        }>;
        "cdn-mc-eu1-fd5f74b2.bereal.network": Array<{
          domain: string;
          weight: number;
        }>;
      };
      analytics: {
        batch: {
          maxLength: number;
          flushAfterMs: number;
        };
        metrics: {
          postSustainLookTimeInMs: number;
        };
        amplitudeSettings: {
          defaultAllowDeny: string;
          allowedEvents: Record<string, unknown>;
          deniedEvents: {
            notification: Array<string>;
            legacyInHouse: Array<string>;
          };
        };
        vectorSettings: {
          defaultAllowDeny: string;
          allowedEvents: {
            impressions: Array<string>;
            notification: Array<string>;
            legacyInHouse: Array<string>;
            applicationOpened: Array<string>;
          };
          deniedEvents: Record<string, unknown>;
        };
      };
      featureFlags: {
        ads: boolean;
        music: boolean;
        musicProviderApple: boolean;
        analyticsVector: boolean;
        analyticsAmplitude: boolean;
        btsDelhiRead: boolean;
        memoriesRecap2024: boolean;
        btsDelhiWrite: boolean;
        realtimeStream: boolean;
        musicProviderSpotify: boolean;
        sunset: boolean;
        oaRandomizedRecommendations: boolean;
        friendsOfFriendsFeed: boolean;
        memoriesRecapRecord: boolean;
        memoriesRecap: boolean;
      };
      featureFlagsSettings: {
        whistler: {
          maxBootstrapCallsCount: number;
          printRolloutBanner: boolean;
          chatGroupMaxSize: number;
          friends: Array<unknown>;
          friendsWithGroupChat: Array<unknown>;
        };
        ads: {
          units: Array<{
            id: string;
            type: string;
          }>;
          refreshMs: number;
          initialPosition: number;
          minimumSpaceInterval: number;
        };
      };
      fofInFeed: {
        pollingRateMs: number;
        delayMs: number;
        size: number;
        belowFriendsCount: number;
      };
    }>();
  }

  async getFeedsFriendsV1() {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get("feeds/friends-v1");
    return response.json<{
      userPosts: null | unknown;
      friendsPosts: Array<{
        user: {
          id: string;
          username: string;
          profilePicture: {
            url: string;
            width: number;
            height: number;
            mediaType: string;
          };
          fullname: string;
          type: string;
        };
        momentId: string;
        region: string;
        posts: Array<{
          id: string;
          userId: string;
          momentId: string;
          primary: {
            url: string;
            width: number;
            height: number;
            mediaType: string;
          };
          secondary: {
            url: string;
            width: number;
            height: number;
            mediaType: string;
          };
          realMojis: Array<{
            id: string;
            user: {
              id: string;
              username: string;
              profilePicture?: {
                url: string;
                width: number;
                height: number;
                mediaType: string;
              };
              type: string;
            };
            media: {
              url: string;
              width: number;
              height: number;
              mediaType: string;
            };
            emoji: string;
            type: string;
            isInstant: boolean;
            postedAt: string;
          }>;
          comments: Array<unknown>;
          tags: Array<unknown>;
          caption: string;
          retakeCounter: number;
          lateInSeconds: number;
          isLate: boolean;
          isMain: boolean;
          isFirst: boolean;
          isResurrected: boolean;
          visibility: Array<string>;
          origin: string;
          postedAt: string;
          takenAt: string;
          creationDate: string;
          createdAt: string;
          updatedAt: string;
          postType: string;
        }>;
        contentMappingEnabled: boolean;
      }>;
      remainingPosts: number;
      maxPostsPerMoment: number;
      eventProtoBytes: Array<unknown>;
    }>();
  }

  async getRecommendationsContacts() {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get("recommendations/contacts");
    return response.json<{
      recommendations: Array<{
        userId: string;
        username: string;
        fullname: string;
        hashedPhoneNumber: string;
        profilePicture: {
          height: number;
          width: number;
          url: string;
        };
        explanation: Array<string>;
        mutualFriends: Array<unknown>;
      }>;
      totalRecommendations: number;
    }>();
  }

  async getRecommendationsFriendsAndReverse(
    hashedPhoneNumber: string,
    limit = 50
  ) {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get(
      "recommendations/friends-and-reverse",
      {
        searchParams: {
          hashed_phone_number: hashedPhoneNumber,
          limit: limit,
        },
      }
    );
    return response.json<{
      recommendations: Array<{
        username: string;
        fullname?: string;
        hashedPhoneNumber: string;
        profilePicture?: {
          url: string;
          width: number;
          height: number;
        };
        userId: string;
        explanation: Array<string>;
        mutualsCount: number;
        mutualFriends: Array<{
          username: string;
          fullname: string;
          profilePicture: {
            url: string;
            width: number;
            height: number;
          };
        }>;
        streakLength: number;
      }>;
      totalRecommendations: number;
    }>();
  }

  async getContentPostsMultiFormatUploadUrl(mimeTypes: Array<string>) {
    if (this.isAccessTokenExpired()) {
      throw new BeRealAccessTokenExpiredError();
    }

    const response = await this.client.get(
      "content/posts/multi-format-upload-url",
      {
        searchParams: {
          mime_types: mimeTypes.join(","),
        },
      }
    );
    return response.json<{
      data: Array<{
        url: string;
        expireAt: string;
        bucket: string;
        path: string;
        headers: {
          "Cache-Control": string;
          "Content-Type": string;
          "x-goog-content-length-range": string;
        };
      }>;
    }>();
  }
}
