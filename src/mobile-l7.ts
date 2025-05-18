import ky, { type KyInstance } from "ky";
import { BEREAL_DEFAULT_HEADERS, type ExtraHeaders } from "./constants.ts";
import { createBeRealSignature } from "./utils.ts";
import { decodeBase64 } from "@std/encoding";

export class BeReal {
  private readonly client: KyInstance;
  private readonly accessToken: string;
  private readonly userId: string;
  private readonly deviceId: string;

  constructor(
    accessToken: string,
    deviceId: string,
    extraHeaders?: ExtraHeaders
  ) {
    this.accessToken = accessToken;
    this.userId = JSON.parse(
      new TextDecoder().decode(decodeBase64(this.accessToken.split(".")[1]))
    ).user_id;
    this.deviceId = deviceId;
    this.client = ky.extend({
      prefixUrl: "https://mobile-l7.bereal.com/api",
      headers: BEREAL_DEFAULT_HEADERS(deviceId, {
        authorization: `Bearer ${this.accessToken}`,
        "bereal-user-id": this.userId,
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

  async getPersonMe() {
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
}
