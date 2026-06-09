/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getRefreshingTokenProvider,
  GetRefreshingTokenProviderConfig,
} from "./getRefreshingTokenProvider";
import { AwsCredentialIdentity } from "@smithy/types";

jest.mock("./token", () => ({
  createToken: jest.fn(),
  validateTokenExpiryInput: jest.fn(),
}));

jest.mock("./runtimeConfig", () => ({
  getCreateTokenConfig: jest.fn(),
}));

import * as tokenModule from "./token";
import * as runtimeConfigModule from "./runtimeConfig";

const MOCK_REGION = "us-west-2";
const MOCK_CREDENTIALS: AwsCredentialIdentity = {
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
};
const START_TIME = Date.UTC(2026, 0, 1, 0, 0, 0);

const createMockToken = (
  amzDate = "20260101T000000Z",
  expiresInSeconds = 3600,
) => {
  const presignedUrl =
    `bedrock.amazonaws.com/?Action=CallWithBearerToken` +
    `&X-Amz-Date=${amzDate}` +
    `&X-Amz-Expires=${expiresInSeconds}` +
    `&X-Amz-SignedHeaders=host` +
    `&X-Amz-Signature=abcdef1234567890` +
    `&Version=1`;
  return `bedrock-api-key-${Buffer.from(presignedUrl, "utf-8").toString("base64")}`;
};

describe("getRefreshingTokenProvider", () => {
  const mockRuntimeCreateConfig = {
    credentials: MOCK_CREDENTIALS,
    region: MOCK_REGION,
    expiresInSeconds: 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME);

    (tokenModule.createToken as jest.Mock).mockResolvedValue(createMockToken());
    (runtimeConfigModule.getCreateTokenConfig as jest.Mock).mockReturnValue(
      mockRuntimeCreateConfig,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should validate expiresInSeconds during initialization", () => {
    const config: GetRefreshingTokenProviderConfig = {
      expiresInSeconds: 7200,
    };

    getRefreshingTokenProvider(config);

    expect(tokenModule.validateTokenExpiryInput).toHaveBeenCalledWith(7200);
  });

  it("should reject negative refreshBeforeExpirySeconds", () => {
    expect(() =>
      getRefreshingTokenProvider({ refreshBeforeExpirySeconds: -1 }),
    ).toThrow("RefreshBeforeExpirySeconds must be non-negative.");
  });

  it("should return cached token while it is not near expiry", async () => {
    const provideToken = getRefreshingTokenProvider({
      refreshBeforeExpirySeconds: 60,
    });

    const firstToken = await provideToken();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME + 10_000);
    const secondToken = await provideToken();

    expect(firstToken).toBe(secondToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(1);
  });

  it("should refresh when the cached token is expired", async () => {
    (tokenModule.createToken as jest.Mock)
      .mockResolvedValueOnce(createMockToken("20260101T000000Z", 1))
      .mockResolvedValueOnce(createMockToken("20260101T000002Z", 3600));

    const provideToken = getRefreshingTokenProvider({
      refreshBeforeExpirySeconds: 0,
    });

    const firstToken = await provideToken();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME + 2_000);
    const secondToken = await provideToken();

    expect(firstToken).not.toBe(secondToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(2);
  });

  it("should refresh when the token enters the refresh window", async () => {
    (tokenModule.createToken as jest.Mock)
      .mockResolvedValueOnce(createMockToken("20260101T000000Z", 10))
      .mockResolvedValueOnce(createMockToken("20260101T000006Z", 10));

    const provideToken = getRefreshingTokenProvider({
      refreshBeforeExpirySeconds: 5,
    });

    const firstToken = await provideToken();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME + 4_000);
    const stillCachedToken = await provideToken();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME + 6_000);
    const refreshedToken = await provideToken();

    expect(stillCachedToken).toBe(firstToken);
    expect(refreshedToken).not.toBe(firstToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(2);
  });

  it("should use credential expiration when it is earlier than token expiration", async () => {
    (tokenModule.createToken as jest.Mock)
      .mockResolvedValueOnce(createMockToken("20260101T000000Z", 3600))
      .mockResolvedValueOnce(createMockToken("20260101T000011Z", 3600));
    const expiringCredentials = {
      ...MOCK_CREDENTIALS,
      expiration: new Date(START_TIME + 10_000),
    };
    (runtimeConfigModule.getCreateTokenConfig as jest.Mock).mockReturnValue({
      credentials: expiringCredentials,
      region: MOCK_REGION,
      expiresInSeconds: 3600,
    });

    const provideToken = getRefreshingTokenProvider({
      refreshBeforeExpirySeconds: 0,
    });

    const firstToken = await provideToken();
    jest.spyOn(Date, "now").mockReturnValue(START_TIME + 11_000);
    const secondToken = await provideToken();

    expect(firstToken).not.toBe(secondToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(2);
  });

  it("should only create one token for concurrent refreshes", async () => {
    let resolveToken: (value: string) => void = () => {};
    (tokenModule.createToken as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveToken = resolve;
      }),
    );

    const provideToken = getRefreshingTokenProvider();
    const firstCall = provideToken();
    const secondCall = provideToken();
    resolveToken(createMockToken());

    const [firstToken, secondToken] = await Promise.all([
      firstCall,
      secondCall,
    ]);

    expect(firstToken).toBe(secondToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(1);
  });

  it("should force refresh when refresh is called", async () => {
    (tokenModule.createToken as jest.Mock)
      .mockResolvedValueOnce(createMockToken("20260101T000000Z", 3600))
      .mockResolvedValueOnce(createMockToken("20260101T000100Z", 3600));

    const provideToken = getRefreshingTokenProvider();

    const firstToken = await provideToken();
    const refreshedToken = await provideToken.refresh();
    const cachedToken = await provideToken();

    expect(refreshedToken).not.toBe(firstToken);
    expect(cachedToken).toBe(refreshedToken);
    expect(tokenModule.createToken).toHaveBeenCalledTimes(2);
  });

  it("should propagate errors from createToken", async () => {
    const createTokenError = new Error("Token creation failed");
    (tokenModule.createToken as jest.Mock).mockRejectedValueOnce(
      createTokenError,
    );

    const provideToken = getRefreshingTokenProvider();
    await expect(provideToken()).rejects.toThrow(createTokenError);
  });
});
