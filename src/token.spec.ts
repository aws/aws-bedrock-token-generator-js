/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { SignatureV4 } from "@smithy/signature-v4";
import { formatUrl } from "@aws-sdk/util-format-url";
import { HttpRequest } from "@smithy/protocol-http";
import { createToken, validateTokenExpiryInput } from "./token";
import { AwsCredentialIdentity, ChecksumConstructor } from "@smithy/types";

jest.mock("@smithy/signature-v4");
jest.mock("@aws-sdk/util-format-url");
jest.mock("@smithy/protocol-http");

const MOCK_SHA256 = jest.fn() as unknown as ChecksumConstructor;

describe("token", () => {
  describe("createToken", () => {
    const EXPECTED_TOKEN_PREFIX = "bedrock-api-key-";
    const EXPECTED_TOKEN_VERSION = "&Version=1";
    const MOCK_FORMATTED_URL =
      "https://bedrock.amazonaws.com/?Action=CallWithBearerToken&X-Amz-Algorithm=" +
      "AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20250715%2Fus-west-2%2Fbedrock%2Faws4_request" +
      "&X-Amz-Date=20250715T050000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=abcdef1234567890";
    const MOCK_REGION = "us-west-2";
    const MOCK_CREDENTIALS: AwsCredentialIdentity = {
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    };

    const mockPresign = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();

      (SignatureV4 as jest.MockedFunction<any>).mockImplementation(() => ({
        presign: mockPresign,
      }));

      (formatUrl as jest.MockedFunction<typeof formatUrl>).mockReturnValue(
        MOCK_FORMATTED_URL,
      );
    });

    it("should create a token with default expiry time", async () => {
      const token = await createToken({
        credentials: MOCK_CREDENTIALS,
        region: MOCK_REGION,
        sha256: MOCK_SHA256,
      });

      expect(SignatureV4).toHaveBeenCalledWith({
        service: "bedrock",
        region: MOCK_REGION,
        credentials: MOCK_CREDENTIALS,
        sha256: MOCK_SHA256,
      });

      // Verify presign was called with correct parameters
      expect(mockPresign).toHaveBeenCalledWith(expect.any(Object), {
        expiresIn: 43200,
      });

      // Verify HttpRequest was constructed correctly
      expect(HttpRequest).toHaveBeenCalledWith({
        method: "POST",
        protocol: "https",
        hostname: "bedrock.amazonaws.com",
        headers: {
          host: "bedrock.amazonaws.com",
        },
        path: "/",
        query: {
          Action: "CallWithBearerToken",
        },
      });

      // Verify formatUrl was called
      expect(formatUrl).toHaveBeenCalled();

      // Verify token format
      expect(token).toMatch(new RegExp(`^${EXPECTED_TOKEN_PREFIX}`));

      // Decode the token and verify it contains the expected parts
      const base64Part = token.substring(EXPECTED_TOKEN_PREFIX.length);
      const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
      expect(decoded).toContain("bedrock.amazonaws.com");
      expect(decoded).toContain("Action=CallWithBearerToken");
      expect(decoded).toContain(EXPECTED_TOKEN_VERSION);
    });

    it("should create a token with custom expiry time", async () => {
      const customExpiryTime = 7200; // 2 hours

      await createToken({
        credentials: MOCK_CREDENTIALS,
        region: MOCK_REGION,
        expiresInSeconds: customExpiryTime,
        sha256: MOCK_SHA256,
      });

      expect(mockPresign).toHaveBeenCalledWith(expect.any(Object), {
        expiresIn: customExpiryTime,
      });
    });

    it("should handle credential provider functions", async () => {
      const credentialProvider = jest.fn().mockResolvedValue(MOCK_CREDENTIALS);

      await createToken({
        credentials: credentialProvider,
        region: MOCK_REGION,
        sha256: MOCK_SHA256,
      });

      // Verify SignatureV4 constructor was called with the credential provider
      expect(SignatureV4).toHaveBeenCalledWith({
        service: "bedrock",
        region: MOCK_REGION,
        credentials: credentialProvider,
        sha256: MOCK_SHA256,
      });
    });

    it("should handle region provider functions", async () => {
      const regionProvider = jest.fn().mockResolvedValue(MOCK_REGION);

      await createToken({
        credentials: MOCK_CREDENTIALS,
        region: regionProvider,
        sha256: MOCK_SHA256,
      });

      // Verify SignatureV4 constructor was called with the region provider
      expect(SignatureV4).toHaveBeenCalledWith({
        service: "bedrock",
        region: regionProvider,
        credentials: MOCK_CREDENTIALS,
        sha256: MOCK_SHA256,
      });
    });

    it("should properly encode the token", async () => {
      // Test-specific mock for formatUrl
      (formatUrl as jest.MockedFunction<typeof formatUrl>).mockReturnValue(
        "https://bedrock.amazonaws.com/?Action=CallWithBearerToken&X-Amz-Signature=test",
      );

      const token = await createToken({
        credentials: MOCK_CREDENTIALS,
        region: MOCK_REGION,
        sha256: MOCK_SHA256,
      });

      // Expected encoded value (without protocol prefix)
      const expectedEncodedPart = Buffer.from(
        "bedrock.amazonaws.com/?Action=CallWithBearerToken&X-Amz-Signature=test&Version=1",
        "utf-8",
      ).toString("base64");

      expect(token).toBe(`${EXPECTED_TOKEN_PREFIX}${expectedEncodedPart}`);
    });

    it("should remove protocol prefix from the URL", async () => {
      // Test-specific mock for formatUrl
      (formatUrl as jest.MockedFunction<typeof formatUrl>).mockReturnValue(
        "https://bedrock.amazonaws.com/?Action=CallWithBearerToken",
      );

      const token = await createToken({
        credentials: MOCK_CREDENTIALS,
        region: MOCK_REGION,
        sha256: MOCK_SHA256,
      });

      // Decode the token and verify it doesn't contain the protocol prefix
      const base64Part = token.substring(EXPECTED_TOKEN_PREFIX.length);
      const decoded = Buffer.from(base64Part, "base64").toString("utf-8");

      expect(decoded).not.toContain("https://");
      expect(decoded).toContain("bedrock.amazonaws.com");
    });
  });

  describe("validateTokenExpiryInput", () => {
    it("should not throw error for valid expiry time", () => {
      expect(() => validateTokenExpiryInput(3600)).not.toThrow();
      expect(() => validateTokenExpiryInput(1)).not.toThrow();
      expect(() => validateTokenExpiryInput(43200)).not.toThrow();
      expect(() => validateTokenExpiryInput(undefined)).not.toThrow();
    });

    it("should throw error for expiry time greater than maximum allowed", () => {
      expect(() => validateTokenExpiryInput(43201)).toThrow(
        "ExpiresInSeconds must be in the range (0, 43200] seconds.",
      );
      expect(() => validateTokenExpiryInput(100000)).toThrow(
        "ExpiresInSeconds must be in the range (0, 43200] seconds.",
      );
    });

    it("should throw error for non-positive expiry time", () => {
      expect(() => validateTokenExpiryInput(0)).toThrow(
        "ExpiresInSeconds must be in the range (0, 43200] seconds.",
      );
      expect(() => validateTokenExpiryInput(-1)).toThrow(
        "ExpiresInSeconds must be in the range (0, 43200] seconds.",
      );
    });
  });
});
