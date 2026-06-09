[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / getRefreshingTokenProvider

# Function: getRefreshingTokenProvider()

> **getRefreshingTokenProvider**(`config?`): [`RefreshingTokenProvider`](../interfaces/RefreshingTokenProvider.md)

Creates a reusable token provider that caches tokens until they are close to
expiry, then automatically generates a replacement token.

## Parameters

### config?

[`GetRefreshingTokenProviderConfig`](../interfaces/GetRefreshingTokenProviderConfig.md) = `{}`

Configuration options for the token provider

## Returns

[`RefreshingTokenProvider`](../interfaces/RefreshingTokenProvider.md)

An async provider function with a `refresh()` method for forced refreshes

## See

[GetRefreshingTokenProviderConfig](../interfaces/GetRefreshingTokenProviderConfig.md)

## Example

```ts
const provideToken = getRefreshingTokenProvider({ region: "us-east-1" });
const token = await provideToken();
```
