import { assertEquals } from "@std/assert";
import {
  BeReal,
  BEREAL_CLIENT_ID,
  BEREAL_CLIENT_SECRET,
  BeRealAuth,
  isAccessTokenExpired,
} from "../src/mod.ts";

Deno.test("BeReal", async (t) => {
  const deviceId = Deno.env.get("BEREAL_DEVICE_ID");
  if (!deviceId) {
    throw new Error("BEREAL_DEVICE_ID is not set");
  }

  let accessToken = Deno.env.get("BEREAL_ACCESS_TOKEN");
  if (!accessToken) {
    throw new Error("BEREAL_ACCESS_TOKEN is not set");
  }

  let refreshToken = Deno.env.get("BEREAL_REFRESH_TOKEN");
  if (!refreshToken) {
    throw new Error("BEREAL_REFRESH_TOKEN is not set");
  }

  if (isAccessTokenExpired(accessToken)) {
    const beRealAuth = new BeRealAuth(deviceId);
    await t.step("refreshToken", async () => {
      if (!refreshToken) {
        throw new Error("BEREAL_REFRESH_TOKEN is not set");
      }
      const token = await beRealAuth.token({
        client_id: BEREAL_CLIENT_ID,
        client_secret: BEREAL_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      });
      assertEquals(typeof token.access_token, "string");
      assertEquals(typeof token.refresh_token, "string");
      accessToken = token.access_token;
      refreshToken = token.refresh_token;

      console.log("New Access Token:", accessToken);
      console.log("New Refresh Token:", refreshToken);
    });
  }

  const beReal = new BeReal(accessToken, deviceId);
  await t.step("getPersonMe", async () => {
    const personMe = await beReal.getPersonMe();
    assertEquals(personMe.id, beReal.userId);
  });
  await t.step("getFeedsFriendsV1", async () => {
    await beReal.getFeedsFriendsV1();
  });
});
