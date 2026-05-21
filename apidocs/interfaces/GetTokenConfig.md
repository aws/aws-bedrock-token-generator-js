[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / GetTokenConfig

# Interface: GetTokenConfig

Configuration options for generating an AWS Bedrock API token.

## Properties

### credentials

> **credentials**: `AwsCredentialIdentity` \| `AwsCredentialIdentityProvider`

AWS credentials to use for signing.
Can be either static credentials or a credentials provider function.

#### See

[https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/)

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

***

### region

> **region**: `string`

AWS region to use for the token (e.g., "us-west-2").

***

### sha256?

> `optional` **sha256?**: `ChecksumConstructor`

SHA-256 implementation used by SignatureV4. Defaults to the platform-native
implementation.
