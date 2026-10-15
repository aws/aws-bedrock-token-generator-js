#!/usr/bin/env node
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getTokenProvider, GetTokenProviderConfig } from "./getTokenProvider";

const USAGE = `Usage: bedrock-token-generator provide-token [options]

Prints a short-term AWS Bedrock API token to stdout.

Options:
  --region <region>             AWS region for the token (default: resolved from environment/config)
  --profile <profile>           AWS profile to load credentials from
  --expires-in-seconds <n>      Token lifetime in seconds, up to 43200 (default: 43200)
  -h, --help                    Show this help
`;

interface Output {
  log: (message: string) => void;
  error: (message: string) => void;
}

const parseOptions = (args: string[]): GetTokenProviderConfig => {
  const config: GetTokenProviderConfig = {};
  const remaining = args.values();
  for (const arg of remaining) {
    const [flag, inline] = arg.split(/=(.*)/s, 2);
    const value = (): string => {
      const v = inline ?? remaining.next().value;
      if (v === undefined) throw new Error(`Missing value for ${flag}`);
      return v;
    };
    switch (flag) {
      case "--region":
        config.region = value();
        break;
      case "--profile":
        config.profile = value();
        break;
      case "--expires-in-seconds": {
        const raw = value();
        const n = Number(raw);
        if (raw.trim() === "" || !Number.isFinite(n)) {
          throw new Error(`Invalid value for ${flag}: ${raw}`);
        }
        config.expiresInSeconds = n;
        break;
      }
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }
  return config;
};

export const run = async (
  argv: string[],
  out: Output = { log: console.log, error: console.error },
): Promise<number> => {
  const [command, ...rest] = argv;
  if (!command || command === "-h" || command === "--help") {
    out.log(USAGE);
    return command ? 0 : 1;
  }
  if (command !== "provide-token") {
    out.error(`Unknown command: ${command}\n\n${USAGE}`);
    return 1;
  }
  if (rest.includes("-h") || rest.includes("--help")) {
    out.log(USAGE);
    return 0;
  }
  try {
    const provideToken = getTokenProvider(parseOptions(rest));
    out.log(await provideToken());
    return 0;
  } catch (e) {
    out.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
};

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
