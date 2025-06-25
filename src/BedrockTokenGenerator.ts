/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatUrl } from "@aws-sdk/util-format-url";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { AwsCredentialIdentity, ChecksumConstructor } from "@smithy/types";
import { Hash } from "@smithy/hash-node";

/**
 * BedrockTokenGenerator provides a lightweight utility to generate short-lived AWS Bearer tokens
 * for use with the Amazon Bedrock API.
 * 
 * The class exposes `getToken()`, a stateless method that returns a fresh token
 * valid for 12 hours using AWS SigV4 signing.
 */
export class BedrockTokenGenerator {
    private static readonly DEFAULT_HOST = "bedrock.amazonaws.com";
    private static readonly DEFAULT_URL = "https://bedrock.amazonaws.com/";
    private static readonly SERVICE_NAME = "bedrock";
    private static readonly AUTH_PREFIX = "bedrock-api-key-";
    private static readonly TOKEN_VERSION = "&Version=1";
    private static readonly TOKEN_EXPIRES_IN = 43200;

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
    public async getToken(credentials: AwsCredentialIdentity, region: string): Promise<string> {
        if (!credentials) {
            throw new Error("Credentials cannot be null");
        }
        
        if (!region || typeof region !== 'string' || region.trim().length === 0) {
            throw new Error("Region must be a non-empty string");
        }

        const signer = new SignatureV4({
            service: BedrockTokenGenerator.SERVICE_NAME,
            region: region,
            credentials: credentials,
            sha256: Hash.bind(null, "sha256") as ChecksumConstructor,
        });

        const request = new HttpRequest({
            method: 'POST',
            protocol: 'https',
            hostname: BedrockTokenGenerator.DEFAULT_HOST,
            headers: {
                host: BedrockTokenGenerator.DEFAULT_HOST,
            },
            path: '/',
            query: {
                Action: 'CallWithBearerToken',
            },
        });

        const presigned = await signer.presign(request, {
            expiresIn: BedrockTokenGenerator.TOKEN_EXPIRES_IN
        });

        // Remove the protocol prefix and add version
        const presignedUrl = formatUrl(presigned).replace('https://', '') + BedrockTokenGenerator.TOKEN_VERSION;

        // Base64 encode the URI
        const encodedString = Buffer.from(presignedUrl, 'utf-8').toString('base64');

        return `${BedrockTokenGenerator.AUTH_PREFIX}${encodedString}`;
    }
}
