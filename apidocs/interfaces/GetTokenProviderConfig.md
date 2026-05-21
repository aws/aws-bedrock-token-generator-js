[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / GetTokenProviderConfig

# Interface: GetTokenProviderConfig

Configuration options for creating a reusable AWS Bedrock API token provider.

## Extends

- `Partial`\<[`GetTokenConfig`](GetTokenConfig.md)\>

## Properties

### credentials?

> `optional` **credentials?**: `AwsCredentialIdentity` \| `AwsCredentialIdentityProvider`

AWS credentials to use for signing.
Can be either static credentials or a credentials provider function.

#### See

[https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/)

#### Inherited from

[`GetTokenConfig`](GetTokenConfig.md).[`credentials`](GetTokenConfig.md#credentials)

***

### expiresInSeconds?

> `optional` **expiresInSeconds?**: `number`

Token expiration time in seconds. The expiration can be configured up to a maximum of 12 hours.
However, the actual token validity period will always be the minimum of the requested expiration time
and the AWS credentials' expiry time.

#### Default

```ts
43200 (12 hour)
```

#### Inherited from

[`GetTokenConfig`](GetTokenConfig.md).[`expiresInSeconds`](GetTokenConfig.md#expiresinseconds)

***

### profile?

> `optional` **profile?**: `string`

AWS profile name to use when loading credentials from shared config.

***

### region?

> `optional` **region?**: `string`

AWS region to use for the token (e.g., "us-west-2").

#### Inherited from

[`GetTokenConfig`](GetTokenConfig.md).[`region`](GetTokenConfig.md#region)

***

### sha256?

> `optional` **sha256?**: `ChecksumConstructor`

SHA-256 implementation used by SignatureV4. Defaults to the platform-native
implementation.

#### Inherited from

[`GetTokenConfig`](GetTokenConfig.md).[`sha256`](GetTokenConfig.md#sha256)
