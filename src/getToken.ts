/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
  ChecksumConstructor,
} from "@smithy/types";
import { createToken, validateTokenExpiryInput } from "./token";
import { getCreateTokenConfig } from "./runtimeConfig";

/**
 * Configuration options for generating an AWS Bedrock API token.
 */
export interface GetTokenConfig {
  /**
   * AWS credentials to use for signing.
   * Can be either static credentials or a credentials provider function.
   * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/}
   */
  credentials: AwsCredentialIdentity | AwsCredentialIdentityProvider;

  /**
   * AWS region to use for the token (e.g., "us-west-2").
   */
  region: string;

  /**
   * Token expiration time in seconds. The expiration can be configured up to a maximum of 12 hours.
   * However, the actual token validity period will always be the minimum of the requested expiration time
   * and the AWS credentials' expiry time.
   * @default 43200 (12 hour)
   */
  expiresInSeconds?: number;

  /**
   * SHA-256 implementation used by SignatureV4. Defaults to the platform-native
   * implementation.
   */
  sha256?: ChecksumConstructor;
}

/**
 * Generates an AWS Bedrock API token.
 *
 * @param config - Configuration options for token generation @see {@link GetTokenConfig}
 * @returns A promise that resolves to a token string
 *
 * @example
 * const token = await getToken({
 *   credentials: { accessKeyId: 'KEY', secretAccessKey: 'SECRET' },
 *   region: 'us-west-2'
 * });
 */
export const getToken = async (config: GetTokenConfig): Promise<string> => {
  validateTokenExpiryInput(config.expiresInSeconds);
  return createToken(getCreateTokenConfig(config));
};
