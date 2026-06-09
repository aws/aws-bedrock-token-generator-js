[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / GetRefreshingTokenProviderConfig

# Interface: GetRefreshingTokenProviderConfig

Configuration options for creating a cached AWS Bedrock API token provider
that regenerates tokens before they expire.

## Extends

- [`GetTokenProviderConfig`](GetTokenProviderConfig.md)

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

#### Inherited from

[`GetTokenProviderConfig`](GetTokenProviderConfig.md).[`profile`](GetTokenProviderConfig.md#profile)

***

### refreshBeforeExpirySeconds?

> `optional` **refreshBeforeExpirySeconds?**: `number`

How many seconds before expiry the provider should regenerate the token.

#### Default

```ts
300 (5 minutes)
```

***

### region?

> `optional` **region?**: `string`

AWS region to use for the token (e.g., "us-west-2").

#### Inherited from

[`GetTokenConfig`](GetTokenConfig.md).[`region`](GetTokenConfig.md#region)
