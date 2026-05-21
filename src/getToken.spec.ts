/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getToken, GetTokenConfig } from "./getToken";
import { AwsCredentialIdentity } from "@smithy/types";
import * as tokenModule from "./token";

// Mock the token module
jest.mock("./token", () => ({
  createToken: jest.fn().mockResolvedValue("mocked-token-value"),
  validateTokenExpiryInput: jest.fn(),
}));

describe("getToken", () => {
  // Constants for testing
  const MOCK_REGION = "us-west-2";
  const MOCK_CREDENTIALS: AwsCredentialIdentity = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call validateTokenExpiryInput with the provided expiresInSeconds", async () => {
    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
      expiresInSeconds: 7200,
    };

    await getToken(config);

    expect(tokenModule.validateTokenExpiryInput).toHaveBeenCalledWith(7200);
  });

  it("should call validateTokenExpiryInput with undefined when expiresInSeconds is not provided", async () => {
    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
    };

    await getToken(config);

    expect(tokenModule.validateTokenExpiryInput).toHaveBeenCalledWith(
      undefined,
    );
  });

  it("should call createToken with the resolved config", async () => {
    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
      expiresInSeconds: 7200,
    };

    await getToken(config);

    expect(tokenModule.createToken).toHaveBeenCalledWith({
      ...config,
      sha256: expect.any(Function),
    });
  });

  it("should return the token from createToken", async () => {
    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
    };

    const token = await getToken(config);

    expect(token).toBe("mocked-token-value");
  });

  it("should handle credential provider functions", async () => {
    const credentialProvider = jest.fn().mockResolvedValue(MOCK_CREDENTIALS);

    const config: GetTokenConfig = {
      credentials: credentialProvider,
      region: MOCK_REGION,
    };

    await getToken(config);

    expect(tokenModule.createToken).toHaveBeenCalledWith({
      ...config,
      sha256: expect.any(Function),
    });
  });

  it("should propagate errors from validateTokenExpiryInput", async () => {
    const validationError = new Error("Invalid expiry time");
    (tokenModule.validateTokenExpiryInput as jest.Mock).mockImplementationOnce(
      () => {
        throw validationError;
      },
    );

    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
      expiresInSeconds: -1, // Invalid value
    };

    await expect(getToken(config)).rejects.toThrow(validationError);
  });

  it("should propagate errors from createToken", async () => {
    const createTokenError = new Error("Token creation failed");
    (tokenModule.createToken as jest.Mock).mockRejectedValueOnce(
      createTokenError,
    );

    const config: GetTokenConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
    };

    await expect(getToken(config)).rejects.toThrow(createTokenError);
  });
});
