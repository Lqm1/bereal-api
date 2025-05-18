import ky, { type KyInstance } from "ky";
import { BEREAL_DEFAULT_HEADERS, type ExtraHeaders } from "./constants.ts";
import { createBeRealSignature } from "./utils.ts";

export class BeRealAuthVonage {
  private readonly client: KyInstance;
  private readonly deviceId: string;

  constructor(deviceId: string, extraHeaders?: ExtraHeaders) {
    this.deviceId = deviceId;
    this.client = ky.extend({
      prefixUrl: "https://auth-l7.bereal.com/api/vonage",
      headers: BEREAL_DEFAULT_HEADERS(deviceId, extraHeaders),
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
      throwHttpErrors: false,
    });
  }

  async dataExchange(json: { phoneNumber: string }) {
    const response = await this.client.post("data-exchange", {
      json,
    });

    return response.json<{
      dataExchange: string;
    }>();
  }

  async requestCode(json: {
    deviceId: string;
    tokens: Array<{
      token: string;
      identifier: "AR" | "RE";
    }>;
    phoneNumber: string;
  }) {
    const response = await this.client.post("request-code", {
      json,
    });
    return response.json<{
      vonageRequestId: string;
      status: string;
    }>();
  }

  async checkCode(json: { code: string; vonageRequestId: string }) {
    const response = await this.client.post("check-code", {
      json,
    });
    return response.json<{
      status: string;
      token: string;
      uid: string;
    }>();
  }
}

export class BeRealAuth {
  private readonly client: KyInstance;
  private readonly deviceId: string;

  constructor(deviceId: string, extraHeaders?: ExtraHeaders) {
    this.deviceId = deviceId;
    this.client = ky.extend({
      prefixUrl: "https://auth-l7.bereal.com",
      headers: BEREAL_DEFAULT_HEADERS(deviceId, extraHeaders),
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

  async token(
    json:
      | {
          client_id: string;
          token: string;
          client_secret: string;
          grant_type: "firebase";
        }
      | {
          client_id: string;
          refresh_token: string;
          client_secret: string;
          grant_type: "refresh_token";
        }
  ) {
    const response = await this.client.post("token", {
      json,
    });
    return response.json<{
      token_type: string;
      access_token: string;
      expires_in: number;
      scope: string;
      refresh_token: string;
    }>();
  }
}
