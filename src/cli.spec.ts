/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { run } from "./cli";
import { getTokenProvider } from "./getTokenProvider";

jest.mock("./getTokenProvider");

describe("cli", () => {
  const out = { log: jest.fn(), error: jest.fn() };
  const provide = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    provide.mockResolvedValue("bedrock-api-key-abc");
    (getTokenProvider as jest.Mock).mockReturnValue(provide);
  });

  it("prints the token for provide-token", async () => {
    expect(await run(["provide-token"], out)).toBe(0);
    expect(getTokenProvider).toHaveBeenCalledWith({});
    expect(out.log).toHaveBeenCalledWith("bedrock-api-key-abc");
  });

  it("passes options through", async () => {
    await run(
      [
        "provide-token",
        "--region",
        "us-west-2",
        "--profile=dev",
        "--expires-in-seconds",
        "60",
      ],
      out,
    );
    expect(getTokenProvider).toHaveBeenCalledWith({
      region: "us-west-2",
      profile: "dev",
      expiresInSeconds: 60,
    });
  });

  it("fails on unknown command and options", async () => {
    expect(await run(["nope"], out)).toBe(1);
    expect(await run(["provide-token", "--bogus"], out)).toBe(1);
    expect(await run(["provide-token", "--region"], out)).toBe(1);
    expect(await run(["provide-token", "--expires-in-seconds", "x"], out)).toBe(
      1,
    );
  });

  it("reports provider errors", async () => {
    provide.mockRejectedValue(new Error("no creds"));
    expect(await run(["provide-token"], out)).toBe(1);
    expect(out.error).toHaveBeenCalledWith("Error: no creds");
  });

  it("shows help", async () => {
    expect(await run(["--help"], out)).toBe(0);
    expect(await run([], out)).toBe(1);
  });
});
