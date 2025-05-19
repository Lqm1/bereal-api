/**
 * BeReal Authentication Module - Provides classes and utilities for authenticating with BeReal's API
 * 
 * This module exports classes for handling BeReal authentication through phone verification.
 * It includes BeRealAuth for main authentication and BeRealAuthVonage for SMS verification code handling.
 * 
 * @example
 * ```ts
 * import { BeRealAuth, BeRealAuthVonage } from "jsr:@lami/bereal-api";
 * 
 * // Initialize authentication with a device ID
 * const authVonage = new BeRealAuthVonage("your-device-id-here");
 * const auth = new BeRealAuth("your-device-id-here");
 * 
 * // Send a data exchange request
 * const { dataExchange } = await authVonage.dataExchange({
 *  phoneNumber: "+1234567890",
 * });
 * 
 * // Arkose Labs verification
 * // blob: dataExchange
 * 
 * // Request verification code sent to phone number
 * const { vonageRequestId } = await authVonage.requestCode({
 *  deviceId: "your-device-id-here",
 *  tokens: [
 *    { token: "arkose-labs-solution-token", identifier: "AR" },
 *  ],
 *  phoneNumber: "+1234567890",
 * });
 * 
 * // Verify the code
 * const { token } = await authVonage.checkCode({
 *  code: "123456",
 *  vonageRequestId,
 * });
 * 
 * // Get access token
 * const { access_token, refresh_token } = await auth.token({
 *  client_id: "your-client-id-here",
 *  client_secret: "your-client-secret-here",
 *  grant_type: "firebase",
 *  token,
 * });
 * ```
 * 
 * @module
 */
import ky, { type KyInstance } from "ky";
import { BEREAL_DEFAULT_HEADERS, type ExtraHeaders } from "./constants.ts";
import { createBeRealSignature } from "./utils.ts";

/**
 * Authentication client for BeReal's Vonage SMS service
 * 
 * This class provides methods for sending and verifying SMS verification codes
 * through BeReal's Vonage integration.
 */
export class BeRealAuthVonage {
  private readonly client: KyInstance;
  private readonly deviceId: string;

  /**
   * Creates a new BeRealAuthVonage instance
   * 
   * @param deviceId - A unique device identifier
   * @param extraHeaders - Optional additional headers for API requests
   */
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

/**
 * Main authentication client for BeReal
 * 
 * This class provides methods for authenticating with BeReal's API
 * including sending verification codes and obtaining access tokens.
 */
export class BeRealAuth {
  private readonly client: KyInstance;
  private readonly deviceId: string;

  /**
   * Creates a new BeRealAuth instance
   * 
   * @param deviceId - A unique device identifier
   * @param extraHeaders - Optional additional headers for API requests
   */
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
