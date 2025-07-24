[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / BedrockTokenGenerator

# Class: BedrockTokenGenerator

BedrockTokenGenerator provides a lightweight utility to generate short-lived AWS Bearer tokens
for use with the Amazon Bedrock API.

The class exposes `getToken()`, a stateless method that returns a fresh token
valid for 12 hours using AWS SigV4 signing.

## Constructors

### Constructor

> **new BedrockTokenGenerator**(): `BedrockTokenGenerator`

Creates a new BedrockTokenGenerator instance.

The generator is stateless and doesn't maintain any internal state.

#### Returns

`BedrockTokenGenerator`

## Methods

### getToken()

> **getToken**(`credentials`, `region`): `Promise`\<`string`\>

Generates a bearer token for AWS Bedrock API authentication.

#### Parameters

##### credentials

`AwsCredentialIdentity`

AWS credentials to use for signing.
                     Must contain access_key and secret_key. May optionally contain session_token.

##### region

`string`

AWS region to use for the token (e.g., "us-west-2", "eu-west-1").

#### Returns

`Promise`\<`string`\>

Promise that resolves to a bearer token string valid for 12 hours.

#### Throws

Error if credentials or region are invalid.
