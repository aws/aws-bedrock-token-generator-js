/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { invalidProvider } from "@smithy/invalid-dependency";
import { Sha256 } from "@aws-crypto/sha256-browser";
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
    sha256: config.sha256 ?? Sha256,
  };
};
