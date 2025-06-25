/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BedrockTokenGenerator } from '../src/BedrockTokenGenerator';
import { AwsCredentialIdentity } from '@smithy/types';

describe('BedrockTokenGenerator', () => {
    let generator: BedrockTokenGenerator;
    let mockCredentials: AwsCredentialIdentity;

    beforeEach(() => {
        generator = new BedrockTokenGenerator();
        mockCredentials = {
            accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
            secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        };
    });

    describe('getToken', () => {
        it('should return a non-null token', async () => {
            const token = await generator.getToken(mockCredentials, 'us-west-2');
            
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('should start with correct prefix', async () => {
            const token = await generator.getToken(mockCredentials, 'us-west-2');
            
            expect(token).toMatch(/^bedrock-api-key-/);
        });

        it('should be properly base64 encoded', async () => {
            const token = await generator.getToken(mockCredentials, 'us-west-2');
            
            const prefix = 'bedrock-api-key-';
            expect(token.startsWith(prefix)).toBe(true);
            
            const base64Part = token.substring(prefix.length);
            
            // Should be able to decode without error
            expect(() => {
                const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
                expect(typeof decoded).toBe('string');
                expect(decoded.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        it('should contain version information', async () => {
            const token = await generator.getToken(mockCredentials, 'us-west-2');
            
            const prefix = 'bedrock-api-key-';
            const base64Part = token.substring(prefix.length);
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
            
            expect(decoded).toContain('&Version=1');
        });

        it('should produce different tokens for different credentials', async () => {
            const credentials1: AwsCredentialIdentity = {
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
            };
            
            const credentials2: AwsCredentialIdentity = {
                accessKeyId: 'AKIAI44QH8DHBEXAMPLE',
                secretAccessKey: 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY'
            };
            
            const token1 = await generator.getToken(credentials1, 'us-west-2');
            const token2 = await generator.getToken(credentials2, 'us-west-2');
            
            expect(token1).not.toBe(token2);
        });

        it('should produce different tokens for different regions', async () => {
            const tokenUsWest = await generator.getToken(mockCredentials, 'us-west-2');
            const tokenUsEast = await generator.getToken(mockCredentials, 'us-east-1');
            
            expect(tokenUsWest).not.toBe(tokenUsEast);
            expect(tokenUsWest).toMatch(/^bedrock-api-key-/);
            expect(tokenUsEast).toMatch(/^bedrock-api-key-/);
        });

        it('should handle session tokens (temporary credentials)', async () => {
            const tempCredentials: AwsCredentialIdentity = {
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                sessionToken: 'AQoDYXdzEJr...<remainder of security token>'
            };
            
            const token = await generator.getToken(tempCredentials, 'us-west-2');
            
            expect(token).toBeDefined();
            expect(token).toMatch(/^bedrock-api-key-/);
            
            // Token with session token should be different from one without
            const tokenWithoutSession = await generator.getToken(mockCredentials, 'us-west-2');
            expect(token).not.toBe(tokenWithoutSession);
        });

        it('should throw error for null credentials', async () => {
            await expect(generator.getToken(null as any, 'us-west-2'))
                .rejects.toThrow('Credentials cannot be null');
        });

        it('should throw error for empty region', async () => {
            await expect(generator.getToken(mockCredentials, ''))
                .rejects.toThrow('Region must be a non-empty string');
        });

        it('should throw error for null region', async () => {
            await expect(generator.getToken(mockCredentials, null as any))
                .rejects.toThrow('Region must be a non-empty string');
        });
    });

    describe('constructor', () => {
        it('should create instance', () => {
            const gen = new BedrockTokenGenerator();
            expect(gen).toBeInstanceOf(BedrockTokenGenerator);
        });
    });
});
