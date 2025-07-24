/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetTokenConfig } from "./getToken";
import {
  createToken,
  CreateTokenConfig,
  validateTokenExpiryInput,
} from "./token";
import { getCreateTokenConfig } from "./runtimeConfig";

/**
 * Configuration options for creating a reusable AWS Bedrock API token provider.
 */
export interface GetTokenProviderConfig extends Partial<GetTokenConfig> {
  /**
   * AWS profile name to use when loading credentials from shared config.
   */
  profile?: string;
}

/**
 * Creates a reusable token provider function with the specified configuration.
 *
 * @param config - Configuration options for the token provider @see {@link GetTokenProviderConfig}
 * @returns An async function that generates AWS Bedrock API tokens when called
 *
 * @example
 * const provideToken = getTokenProvider();
 * const token = await provideToken();
 */
export const getTokenProvider = (config: GetTokenProviderConfig = {}) => {
  validateTokenExpiryInput(config.expiresInSeconds);
  let createTokenConfig: CreateTokenConfig;
  return async (): Promise<string> => {
    if (!createTokenConfig) {
      createTokenConfig = getCreateTokenConfig(config);
    }
    return createToken(createTokenConfig);
  };
};
