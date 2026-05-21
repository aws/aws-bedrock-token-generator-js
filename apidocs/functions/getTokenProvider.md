[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / getTokenProvider

# Function: getTokenProvider()

> **getTokenProvider**(`config?`): () => `Promise`\<`string`\>

Creates a reusable token provider function with the specified configuration.

## Parameters

### config?

[`GetTokenProviderConfig`](../interfaces/GetTokenProviderConfig.md) = `{}`

Configuration options for the token provider

## Returns

An async function that generates AWS Bedrock API tokens when called

() => `Promise`\<`string`\>

## See

[GetTokenProviderConfig](../interfaces/GetTokenProviderConfig.md)

## Example

```ts
const provideToken = getTokenProvider();
const token = await provideToken();
```
