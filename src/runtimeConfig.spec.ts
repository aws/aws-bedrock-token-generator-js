/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCreateTokenConfig } from "./runtimeConfig";
import { AwsCredentialIdentity } from "@smithy/types";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { loadConfig } from "@smithy/node-config-provider";
import {
  NODE_REGION_CONFIG_OPTIONS,
  NODE_REGION_CONFIG_FILE_OPTIONS,
} from "@smithy/config-resolver";

// Define mocks with minimal implementation
jest.mock("@aws-sdk/credential-providers", () => ({
  fromNodeProviderChain: jest.fn(),
}));

jest.mock("@smithy/node-config-provider", () => ({
  loadConfig: jest.fn(),
}));

describe("runtimeConfig", () => {
  // Constants for testing
  const MOCK_REGION = "us-west-2";
  const MOCK_CREDENTIALS: AwsCredentialIdentity = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  };
  const MOCK_PROFILE = "test-profile";
  const MOCK_PROVIDER_CHAIN_CREDENTIALS = {
    accessKeyId: "PROVIDER_CHAIN_ACCESS_KEY",
    secretAccessKey: "PROVIDER_CHAIN_SECRET_KEY",
  };
  const MOCK_LOADED_REGION = "eu-central-1";

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations for each test
    (fromNodeProviderChain as jest.Mock).mockReturnValue(
      MOCK_PROVIDER_CHAIN_CREDENTIALS,
    );

    // Create a mock region provider function that returns the mock region
    const mockRegionProvider = jest.fn().mockResolvedValue(MOCK_LOADED_REGION);
    (loadConfig as jest.Mock).mockReturnValue(mockRegionProvider);
  });

  it("should use provided credentials and region when available", () => {
    const config = {
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
      expiresInSeconds: 7200,
    };

    const result = getCreateTokenConfig(config);

    expect(result).toEqual({
      credentials: MOCK_CREDENTIALS,
      region: MOCK_REGION,
      expiresInSeconds: 7200,
      sha256: expect.any(Function),
    });

    // Verify provider functions were not called
    expect(fromNodeProviderChain).not.toHaveBeenCalled();
    expect(loadConfig).not.toHaveBeenCalled();
  });

  it("should use fromNodeProviderChain when credentials are not provided", () => {
    const config = {
      region: MOCK_REGION,
    };

    const result = getCreateTokenConfig(config);

    expect(result).toEqual({
      credentials: MOCK_PROVIDER_CHAIN_CREDENTIALS,
      region: MOCK_REGION,
      sha256: expect.any(Function),
    });

    expect(fromNodeProviderChain).toHaveBeenCalledWith({
      profile: undefined,
    });
    expect(loadConfig).not.toHaveBeenCalled();
  });

  it("should use loadConfig when region is not provided", async () => {
    const config = {
      credentials: MOCK_CREDENTIALS,
    };

    const result = getCreateTokenConfig(config);

    // Verify the result contains the credentials and a Provider<string> for region
    expect(result.credentials).toEqual(MOCK_CREDENTIALS);
    expect(typeof result.region).toBe("function");

    expect(fromNodeProviderChain).not.toHaveBeenCalled();
    expect(loadConfig).toHaveBeenCalledWith(NODE_REGION_CONFIG_OPTIONS, {
      ...NODE_REGION_CONFIG_FILE_OPTIONS,
      profile: undefined,
    });

    // Verify the region provider function returns the expected value
    const regionProvider = result.region as any;
    const region = await regionProvider();
    expect(region).toBe(MOCK_LOADED_REGION);
  });

  it("should use both provider functions when neither credentials nor region are provided", async () => {
    const config = {};

    const result = getCreateTokenConfig(config);

    // Verify the result contains the provider chain credentials and a Provider<string> for region
    expect(result.credentials).toEqual(MOCK_PROVIDER_CHAIN_CREDENTIALS);
    expect(typeof result.region).toBe("function");

    expect(fromNodeProviderChain).toHaveBeenCalledWith({
      profile: undefined,
    });
    expect(loadConfig).toHaveBeenCalledWith(NODE_REGION_CONFIG_OPTIONS, {
      ...NODE_REGION_CONFIG_FILE_OPTIONS,
      profile: undefined,
    });

    // Verify the region provider function returns the expected value
    const regionProvider = result.region as any;
    const region = await regionProvider();
    expect(region).toBe(MOCK_LOADED_REGION);
  });

  it("should pass profile to provider functions when specified", async () => {
    const config = {
      profile: MOCK_PROFILE,
    };

    const result = getCreateTokenConfig(config);

    // Verify the result contains the provider chain credentials, a Provider<string> for region, and the profile
    expect(result.credentials).toEqual(MOCK_PROVIDER_CHAIN_CREDENTIALS);
    expect(typeof result.region).toBe("function");

    expect(fromNodeProviderChain).toHaveBeenCalledWith({
      profile: MOCK_PROFILE,
    });
    expect(loadConfig).toHaveBeenCalledWith(NODE_REGION_CONFIG_OPTIONS, {
      ...NODE_REGION_CONFIG_FILE_OPTIONS,
      profile: MOCK_PROFILE,
    });

    // Verify the region provider function returns the expected value
    const regionProvider = result.region as any;
    const region = await regionProvider();
    expect(region).toBe(MOCK_LOADED_REGION);
  });
});
