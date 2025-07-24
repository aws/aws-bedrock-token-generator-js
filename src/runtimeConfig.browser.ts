/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { invalidProvider } from "@smithy/invalid-dependency";
import { CreateTokenConfig } from "./token";
import { GetTokenProviderConfig } from "./getTokenProvider";

/**
 * @internal
 */
export const getCreateTokenConfig = (
  config: GetTokenProviderConfig,
): CreateTokenConfig => {
  return {
    ...config,
    credentials: config.credentials ?? invalidProvider("Credential is missing"),
    region: config.region ?? invalidProvider("Region is missing"),
  };
};
