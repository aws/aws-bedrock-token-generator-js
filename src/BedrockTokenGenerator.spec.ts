/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BedrockTokenGenerator } from "./BedrockTokenGenerator";
import { AwsCredentialIdentity } from "@smithy/types";
import { getToken } from "./getToken";

// Define mocks with minimal implementation
jest.mock("./getToken", () => ({
  getToken: jest.fn(),
}));

describe("BedrockTokenGenerator", () => {
  // Constants for testing
  const MOCK_REGION = "us-west-2";
  const MOCK_CREDENTIALS: AwsCredentialIdentity = {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  };
  const MOCK_TOKEN = "bedrock-api-key-mocktoken123";

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations for each test
    (getToken as jest.Mock).mockResolvedValue(MOCK_TOKEN);
  });

  describe("constructor", () => {
    it("should create an instance", () => {
      const generator = new BedrockTokenGenerator();
      expect(generator).toBeInstanceOf(BedrockTokenGenerator);
    });
  });

  describe("getToken", () => {
    it("should call getToken with credentials and region", async () => {
      const generator = new BedrockTokenGenerator();
      const token = await generator.getToken(MOCK_CREDENTIALS, MOCK_REGION);

      expect(getToken).toHaveBeenCalledWith({
        credentials: MOCK_CREDENTIALS,
        region: MOCK_REGION,
        expiresInSeconds: 43200, // 12 hours in seconds
      });

      expect(token).toBe(MOCK_TOKEN);
    });

    it("should propagate errors from getToken", async () => {
      const error = new Error("Token generation failed");
      (getToken as jest.Mock).mockRejectedValueOnce(error);

      const generator = new BedrockTokenGenerator();

      await expect(
        generator.getToken(MOCK_CREDENTIALS, MOCK_REGION),
      ).rejects.toThrow("Token generation failed");
    });
  });
});
