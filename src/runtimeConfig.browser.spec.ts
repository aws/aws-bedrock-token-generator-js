/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCreateTokenConfig } from "./runtimeConfig.browser";
import { AwsCredentialIdentity } from "@smithy/types";
import { invalidProvider } from "@smithy/invalid-dependency";

// Define mocks with minimal implementation
jest.mock("@smithy/invalid-dependency", () => ({
  invalidProvider: jest.fn((message) => {
    return () => {
      throw new Error(message);
    };
  }),
}));

describe("runtimeConfig.browser", () => {
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

    // Verify invalidProvider was not called
    expect(invalidProvider).not.toHaveBeenCalled();
  });

  it("should use invalidProvider when credentials are not provided", () => {
    const config = {
      region: MOCK_REGION,
    };

    const result = getCreateTokenConfig(config);

    expect(result.region).toBe(MOCK_REGION);
    expect(typeof result.credentials).toBe("function");

    expect(invalidProvider).toHaveBeenCalledWith("Credential is missing");

    // Verify the invalidProvider function throws the expected error
    expect(() => {
      const credentialsProvider = result.credentials as any;
      credentialsProvider();
    }).toThrow("Credential is missing");
  });

  it("should use invalidProvider when region is not provided", () => {
    const config = {
      credentials: MOCK_CREDENTIALS,
    };

    const result = getCreateTokenConfig(config);

    expect(result.credentials).toBe(MOCK_CREDENTIALS);
    expect(typeof result.region).toBe("function");

    expect(invalidProvider).toHaveBeenCalledWith("Region is missing");

    // Verify the invalidProvider function throws the expected error
    expect(() => {
      const regionProvider = result.region as any;
      regionProvider();
    }).toThrow("Region is missing");
  });

  it("should use invalidProvider for both when neither credentials nor region are provided", () => {
    const config = {};

    const result = getCreateTokenConfig(config);

    expect(typeof result.credentials).toBe("function");
    expect(typeof result.region).toBe("function");

    expect(invalidProvider).toHaveBeenCalledWith("Credential is missing");
    expect(invalidProvider).toHaveBeenCalledWith("Region is missing");

    // Verify the invalidProvider functions throw the expected errors
    expect(() => {
      const credentialsProvider = result.credentials as any;
      credentialsProvider();
    }).toThrow("Credential is missing");

    expect(() => {
      const regionProvider = result.region as any;
      regionProvider();
    }).toThrow("Region is missing");
  });
});
