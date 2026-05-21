/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { loadConfig } from "@smithy/node-config-provider";
import {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
} from "@smithy/config-resolver";
import { Hash } from "@smithy/hash-node";
import { ChecksumConstructor } from "@smithy/types";
import { GetTokenProviderConfig } from "./getTokenProvider";
import { CreateTokenConfig } from "./token";

/**
 * @internal
 */
export const getCreateTokenConfig = (
  config: GetTokenProviderConfig,
): CreateTokenConfig => {
  return {
    ...config,
    credentials:
      config.credentials ??
      fromNodeProviderChain({
        profile: config.profile,
      }),
    region:
      config.region ??
      loadConfig(NODE_REGION_CONFIG_OPTIONS, {
        ...NODE_REGION_CONFIG_FILE_OPTIONS,
        profile: config.profile,
      }),
    sha256: config.sha256 ?? (Hash.bind(null, "sha256") as ChecksumConstructor),
  };
};
