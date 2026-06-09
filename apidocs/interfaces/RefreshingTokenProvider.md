[**@aws/bedrock-token-generator**](../README.md)

***

[@aws/bedrock-token-generator](../README.md) / RefreshingTokenProvider

# Interface: RefreshingTokenProvider()

A token provider that caches generated tokens and refreshes them on demand.

> **RefreshingTokenProvider**(): `Promise`\<`string`\>

Returns a cached token when it is still valid, otherwise generates a new one.

## Returns

`Promise`\<`string`\>

## Methods

### refresh()

> **refresh**(): `Promise`\<`string`\>

Forces token regeneration and updates the cached token.

#### Returns

`Promise`\<`string`\>
