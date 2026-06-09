/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AwsCredentialIdentity, Provider } from "@smithy/types";
import { GetTokenProviderConfig } from "./getTokenProvider";
import {
  createToken,
  CreateTokenConfig,
  validateTokenExpiryInput,
} from "./token";
import { getCreateTokenConfig } from "./runtimeConfig";

const DEFAULT_REFRESH_BEFORE_EXPIRY_SECONDS = 300; // 5 minutes in seconds
const AUTH_PREFIX = "bedrock-api-key-";

/**
 * Configuration options for creating a cached AWS Bedrock API token provider
 * that regenerates tokens before they expire.
 */
export interface GetRefreshingTokenProviderConfig extends GetTokenProviderConfig {
  /**
   * How many seconds before expiry the provider should regenerate the token.
   * @default 300 (5 minutes)
   */
  refreshBeforeExpirySeconds?: number;
}

/**
 * A token provider that caches generated tokens and refreshes them on demand.
 */
export interface RefreshingTokenProvider {
  /**
   * Returns a cached token when it is still valid, otherwise generates a new one.
   */
  (): Promise<string>;

  /**
   * Forces token regeneration and updates the cached token.
   */
  refresh(): Promise<string>;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

/**
 * Creates a reusable token provider that caches tokens until they are close to
 * expiry, then automatically generates a replacement token.
 *
 * @param config - Configuration options for the token provider @see {@link GetRefreshingTokenProviderConfig}
 * @returns An async provider function with a `refresh()` method for forced refreshes
 *
 * @example
 * const provideToken = getRefreshingTokenProvider({ region: "us-east-1" });
 * const token = await provideToken();
 */
export const getRefreshingTokenProvider = (
  config: GetRefreshingTokenProviderConfig = {},
): RefreshingTokenProvider => {
  validateTokenExpiryInput(config.expiresInSeconds);
  validateRefreshBeforeExpiryInput(config.refreshBeforeExpirySeconds);

  const refreshBeforeExpirySeconds =
    config.refreshBeforeExpirySeconds ?? DEFAULT_REFRESH_BEFORE_EXPIRY_SECONDS;

  let createTokenConfig: CreateTokenConfig;
  let cache: TokenCache | undefined;
  let refreshPromise: Promise<string> | undefined;

  const refresh = async (): Promise<string> => {
    if (!createTokenConfig) {
      createTokenConfig = getCreateTokenConfig(config);
    }

    const { token, expiresAt } =
      await createTokenWithExpiration(createTokenConfig);
    cache = { token, expiresAt };
    return token;
  };

  const provider = (async (): Promise<string> => {
    if (cache && !shouldRefresh(cache, refreshBeforeExpirySeconds)) {
      return cache.token;
    }

    refreshPromise ??= refresh().finally(() => {
      refreshPromise = undefined;
    });

    return refreshPromise;
  }) as RefreshingTokenProvider;

  provider.refresh = async (): Promise<string> => {
    refreshPromise = refresh().finally(() => {
      refreshPromise = undefined;
    });

    return refreshPromise;
  };

  return provider;
};

const shouldRefresh = (
  cache: TokenCache,
  refreshBeforeExpirySeconds: number,
): boolean => cache.expiresAt - refreshBeforeExpirySeconds * 1000 <= Date.now();

const createTokenWithExpiration = async (
  config: CreateTokenConfig,
): Promise<TokenCache> => {
  const credentials = await resolveProvider(config.credentials);
  const region = await resolveProvider(config.region);
  const token = await createToken({
    ...config,
    credentials,
    region,
  });
  const expiresAt = getTokenExpiration(token, credentials);

  if (expiresAt === undefined) {
    throw new Error("Unable to determine token expiration.");
  }

  return { token, expiresAt };
};

const resolveProvider = async <T>(value: T | Provider<T>): Promise<T> => {
  if (typeof value === "function") {
    return (value as Provider<T>)();
  }

  return value;
};

const getTokenExpiration = (
  token: string,
  credentials: AwsCredentialIdentity,
): number | undefined => {
  const tokenExpiration = getPresignedUrlExpiration(token);
  const credentialExpiration = getCredentialExpiration(credentials);

  if (tokenExpiration !== undefined && credentialExpiration !== undefined) {
    return Math.min(tokenExpiration, credentialExpiration);
  }

  return tokenExpiration ?? credentialExpiration;
};

const getPresignedUrlExpiration = (token: string): number | undefined => {
  if (!token.startsWith(AUTH_PREFIX)) {
    return undefined;
  }

  let url: URL;
  try {
    const encoded = token.slice(AUTH_PREFIX.length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    url = new URL(`https://${decoded}`);
  } catch {
    return undefined;
  }

  const amzDate = url.searchParams.get("X-Amz-Date");
  const expiresInSeconds = Number(url.searchParams.get("X-Amz-Expires"));

  if (!amzDate || !Number.isFinite(expiresInSeconds)) {
    return undefined;
  }

  const signedAt = parseAmzDate(amzDate);
  if (signedAt === undefined) {
    return undefined;
  }

  return signedAt + expiresInSeconds * 1000;
};

const getCredentialExpiration = (
  credentials: AwsCredentialIdentity,
): number | undefined => {
  const expiration = credentials.expiration?.getTime();
  return expiration !== undefined && Number.isFinite(expiration)
    ? expiration
    : undefined;
};

const parseAmzDate = (value: string): number | undefined => {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute, second] = match;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
};

const validateRefreshBeforeExpiryInput = (
  refreshBeforeExpirySeconds?: number,
) => {
  if (
    refreshBeforeExpirySeconds !== undefined &&
    refreshBeforeExpirySeconds < 0
  ) {
    throw new Error("RefreshBeforeExpirySeconds must be non-negative.");
  }
};
