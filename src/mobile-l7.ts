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
}
