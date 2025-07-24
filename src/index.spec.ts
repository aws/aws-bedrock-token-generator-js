/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as bedrockTokenGenerator from "./index";

describe("@aws/bedrock-token-generator", () => {
  it("has three exports", () => {
    expect(Object.keys(bedrockTokenGenerator).length).toBe(3);
  });

  it("exports getToken", () => {
    expect(bedrockTokenGenerator.getToken).toBeDefined();
  });

  it("exports getTokenProvider", () => {
    expect(bedrockTokenGenerator.getTokenProvider).toBeDefined();
  });

  it("exports BedrockTokenGenerator", () => {
    expect(bedrockTokenGenerator.BedrockTokenGenerator).toBeDefined();
  });
});
