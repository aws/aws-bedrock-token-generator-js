/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getTokenProvider, GetTokenProviderConfig } from "./getTokenProvider";
import { AwsCredentialIdentity } from "@smithy/types";

// Define mocks with minimal implementation
jest.mock("./token", () => ({
  createToken: jest.fn(),
  validateTokenExpiryInput: jest.fn(),
}));

jest.mock("./runtimeConfig", () => ({
  getCreateTokenConfig: jest.fn(),
}));

// Import after mocking to get the mocked versions
import * as tokenModule from "./token";
import * as runtimeConfigModule from "./runtimeConfig";

describe("getTokenProvider", () => {
  // Constants for testing
  const MOCK_REGION = "us-west-2";
  const MOCK_CREDENTIALS: AwsCredentialIdentity = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  };
  const mockRuntimeCreateConfig = {
    credentials: {
      accessKeyId: "MOCK_ACCESS_KEY",
      secretAccessKey: "MOCK_SECRET_KEY",
    },
    region: "us-west-2",
    expiresInSeconds: 3600,
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations for each test
    (tokenModule.createToken as jest.Mock).mockResolvedValue(
      "mocked-token-value",
    );

    (runtimeConfigModule.getCreateTokenConfig as jest.Mock).mockReturnValue(
      mockRuntimeCreateConfig,
    );
  });

  it("should validate expiresInSeconds during initialization", () => {
    const config: GetTokenProviderConfig = {
      expiresInSeconds: 7200,
    };

    getTokenProvider(config);

    expect(tokenModule.validateTokenExpiryInput).toHaveBeenCalledWith(7200);
  });

  it("should not throw when expiresInSeconds is not provided", () => {
    expect(() => getTokenProvider()).not.toThrow();
    expect(tokenModule.validateTokenExpiryInput).toHaveBeenCalledWith(
      undefined,
    );
  });

  it("should return a function that provides tokens", async () => {
    const provideToken = getTokenProvider();

    expect(typeof provideToken).toBe("function");

    const token = await provideToken();
    expect(token).toBe("mocked-token-value");
  });

  it("should call getCreateTokenConfig only once across multiple invocations", async () => {
    const config: GetTokenProviderConfig = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
    };

    const provideToken = getTokenProvider(config);

    // First call
    await provideToken();
    expect(runtimeConfigModule.getCreateTokenConfig).toHaveBeenCalledTimes(1);
    expect(runtimeConfigModule.getCreateTokenConfig).toHaveBeenCalledWith(
      config,
    );

    // Second call
    await provideToken();
    expect(runtimeConfigModule.getCreateTokenConfig).toHaveBeenCalledTimes(1);
    // getCreateTokenConfig should not be called again
  });

  it("should call createToken on each invocation", async () => {
    const provideToken = getTokenProvider();

    // First call
    await provideToken();
    expect(tokenModule.createToken).toHaveBeenCalledTimes(1);

    // Second call
    await provideToken();
    expect(tokenModule.createToken).toHaveBeenCalledTimes(2);
  });

  it("should pass the config from getCreateTokenConfig to createToken", async () => {
    const provideToken = getTokenProvider();
    await provideToken();

    expect(tokenModule.createToken).toHaveBeenCalledWith(
      mockRuntimeCreateConfig,
    );
  });

  it("should propagate errors from validateTokenExpiryInput", () => {
    const validationError = new Error("Invalid expiry time");
    (tokenModule.validateTokenExpiryInput as jest.Mock).mockImplementationOnce(
      () => {
        throw validationError;
      },
    );

    expect(() => getTokenProvider({ expiresInSeconds: -1 })).toThrow(
      validationError,
    );
  });

  it("should propagate errors from createToken", async () => {
    const createTokenError = new Error("Token creation failed");
    (tokenModule.createToken as jest.Mock).mockRejectedValueOnce(
      createTokenError,
    );

    const provideToken = getTokenProvider();
    await expect(provideToken()).rejects.toThrow(createTokenError);
  });

  it("should handle profile option", async () => {
    const config: GetTokenProviderConfig = {
      profile: "test-profile",
    };

    const provideToken = getTokenProvider(config);

    // Actually invoke the provider function
    await provideToken();

    expect(runtimeConfigModule.getCreateTokenConfig).toHaveBeenCalledWith(
      config,
    );
    expect(tokenModule.createToken).toHaveBeenCalled();
  });

  it("should handle empty config", async () => {
    const provideToken = getTokenProvider();

    // Actually invoke the provider function
    await provideToken();

    expect(runtimeConfigModule.getCreateTokenConfig).toHaveBeenCalledWith({});
    expect(tokenModule.createToken).toHaveBeenCalled();
  });
});
