[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / getToken

# Function: getToken()

> **getToken**(`config`): `Promise`\<`string`\>

Generates an AWS Bedrock API token.

## Parameters

### config

[`GetTokenConfig`](../interfaces/GetTokenConfig.md)

Configuration options for token generation

## Returns

`Promise`\<`string`\>

A promise that resolves to a token string

## See

[GetTokenConfig](../interfaces/GetTokenConfig.md)

## Example

```ts
const token = await getToken({
  credentials: { accessKeyId: 'KEY', secretAccessKey: 'SECRET' },
  region: 'us-west-2'
});
```
