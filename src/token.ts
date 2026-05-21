/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
  ChecksumConstructor,
  Provider,
} from "@smithy/types";
import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@smithy/protocol-http";
import { formatUrl } from "@aws-sdk/util-format-url";

const MAX_TOKEN_EXPIRES_IN_SECONDS = 43200; // 12 hours in seconds
const DEFAULT_TOKEN_EXPIRES_IN_SECONDS = 43200; // 12 hour in seconds
const SERVICE_NAME = "bedrock";
const DEFAULT_HOST = "bedrock.amazonaws.com";
const AUTH_PREFIX = "bedrock-api-key-";
const TOKEN_VERSION = "&Version=1";
const PROTOCOL = "https";
const PROTOCOL_PREFIX = `${PROTOCOL}://`;
const ACTION = "CallWithBearerToken";

/**
 * @internal
 */
export interface CreateTokenConfig {
  expiresInSeconds?: number;
  credentials: AwsCredentialIdentity | AwsCredentialIdentityProvider;
  region: string | Provider<string>;
  sha256: ChecksumConstructor;
}

/**
 * @internal
 */
export const createToken = async (
  config: CreateTokenConfig,
): Promise<string> => {
  const expiresInSeconds =
    config.expiresInSeconds || DEFAULT_TOKEN_EXPIRES_IN_SECONDS;
  const signer = new SignatureV4({
    service: SERVICE_NAME,
    region: config.region,
    credentials: config.credentials,
    sha256: config.sha256,
  });

  const request = new HttpRequest({
    method: "POST",
    protocol: PROTOCOL,
    hostname: DEFAULT_HOST,
    headers: {
      host: DEFAULT_HOST,
    },
    path: "/",
    query: {
      Action: ACTION,
    },
  });

  const presigned = await signer.presign(request, {
    expiresIn: expiresInSeconds,
  });

  // Remove the protocol prefix and add version
  const presignedUrl = `${formatUrl(presigned).replace(PROTOCOL_PREFIX, "")}${TOKEN_VERSION}`;

  // Base64 encode the URI
  const encodedString = Buffer.from(presignedUrl, "utf-8").toString("base64");

  return `${AUTH_PREFIX}${encodedString}`;
};

/**
 * @internal
 */
export const validateTokenExpiryInput = (expiresInSeconds?: number) => {
  if (
    expiresInSeconds !== undefined &&
    (expiresInSeconds > MAX_TOKEN_EXPIRES_IN_SECONDS || expiresInSeconds <= 0)
  ) {
    throw new Error(
      `ExpiresInSeconds must be in the range (0, ${MAX_TOKEN_EXPIRES_IN_SECONDS}] seconds.`,
    );
  }
};
