/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AwsCredentialIdentity } from "@smithy/types";
import { getToken } from "./getToken";

/**
 * BedrockTokenGenerator provides a lightweight utility to generate short-lived AWS Bearer tokens
 * for use with the Amazon Bedrock API.
 *
 * The class exposes `getToken()`, a stateless method that returns a fresh token
 * valid for 12 hours using AWS SigV4 signing.
 */
export class BedrockTokenGenerator {
  private static readonly MAX_EXPIRES_IN_SECONDS = 43200; // 12 hours in seconds
  /**
   * Creates a new BedrockTokenGenerator instance.
   *
   * The generator is stateless and doesn't maintain any internal state.
   */
  constructor() {}

  /**
   * Generates a bearer token for AWS Bedrock API authentication.
   *
   * @param credentials - AWS credentials to use for signing.
   *                      Must contain access_key and secret_key. May optionally contain session_token.
   * @param region - AWS region to use for the token (e.g., "us-west-2", "eu-west-1").
   * @returns Promise that resolves to a bearer token string valid for 12 hours.
   * @throws Error if credentials or region are invalid.
   */
  public async getToken(
    credentials: AwsCredentialIdentity,
    region: string,
  ): Promise<string> {
    return getToken({
      credentials,
      region,
      expiresInSeconds: BedrockTokenGenerator.MAX_EXPIRES_IN_SECONDS,
    });
  }
}
