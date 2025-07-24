# AWS Bedrock Token Generator for JavaScript/TypeScript

[![npm version](https://badge.fury.io/js/aws-bedrock-token-generator.svg)](https://badge.fury.io/js/aws-bedrock-token-generator)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/aws-bedrock-token-generator.svg)](https://nodejs.org/)

A lightweight library for generating short-term bearer tokens for AWS Bedrock API authentication.

## Features

- ✅ **Simple API**: Async functions that generate bearer tokens
- ✅ **Secure**: Uses AWS SigV4 signing with configurable token expiration (up to 12 hours)
- ✅ **AWS SDK Integration**: Seamlessly works with AWS credential providers
- ✅ **Lightweight**: Minimal dependencies, focused functionality
- ✅ **Well-tested**: Comprehensive unit tests with multiple scenarios
- ✅ **TypeScript**: Full type definitions for better IDE experience

## Installation

```bash
npm install @aws/bedrock-token-generator
```

## Quick Start

### Using Token Provider with Default Credential and Region Provider

```typescript
import { getTokenProvider } from "@aws/bedrock-token-generator";

// Create a token provider that uses default credentials and region providers.
// You can configure it to use other credential providers.
const provideToken = getTokenProvider();

async function example() {
    
  const token = await provideToken();

  // Use the token for API calls. The token has a default expiration of 12 hour.
  // If the expiresInSeconds parameter is specified during token creation, the 
  // expiration can be configured up to a maximum of 12 hours. However, the actual 
  // token validity period will always be the minimum of the requested expiration 
  // time and the AWS credentials' expiry time
  console.log(`Bearer Token: ${token}`);
}
```

### Using Token Provider with Credential Provider and Region

You can find the supported credentials provider [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/).

```typescript
import { getTokenProvider } from "@aws/bedrock-token-generator";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";

const provideToken = getTokenProvider({
  credentials: fromTemporaryCredentials({
    params: {
      RoleArn: "arn:aws:iam::123456789012:role/BedrockRole",
    },
  }),
  region: "us-east-1",
});

async function example() {
    
  const token = await provideToken();

  // Use the token for API calls. The token has a default expiration of 12 hour.
  // If the expiresInSeconds parameter is specified during token creation, the 
  // expiration can be configured up to a maximum of 12 hours. However, the actual 
  // token validity period will always be the minimum of the requested expiration 
  // time and the AWS credentials' expiry time
  console.log(`Bearer Token: ${token}`);
}
```

### Using Token Provider with Specific Credentials, Region and Expiry

```typescript
import { getTokenProvider } from "@aws/bedrock-token-generator";

const credentials = {
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  sessionToken: "YOUR_SESSION_TOKEN",
};

const provideToken = getTokenProvider({
  credentials,
  region: "us-east-1",
  expiresInSeconds: 7200,
});

async function example() {
  const token = await provideToken();

  // Use the token for API calls. The token has an expiration of 2 hour. However, the actual token validity period
  // will always be the minimum of the requested expiration time and the AWS credentials' expiry time
  console.log(`Bearer Token: ${token}`);
}
```

### Using Stateless Function with Specific Credentials, Region and Expiry

```typescript
import { getToken } from "@aws/bedrock-token-generator";

async function example() {
  const credentials = {
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
    sessionToken: "YOUR_SESSION_TOKEN",
  };

  const token = await getToken({
    credentials,
    region: "us-east-1",
    expiresInSeconds: 7200,
  });

  // Use the token for API calls. The token has an expiration of 2 hour. However, the actual token validity period
  // will always be the minimum of the requested expiration time and the AWS credentials' expiry time
  console.log(`Bearer Token: ${token}`);
}
```

## API Reference

- [API Reference](apidocs/README.md) - Detailed API documentation

## Token Format

The generated tokens follow this format:

```
bedrock-api-key-<base64-encoded-presigned-url>&Version=1
```

- **Prefix**: `bedrock-api-key-` identifies the token type
- **Payload**: Base64-encoded presigned URL with embedded credentials
- **Version**: `&Version=1` for future compatibility
- **Expiration**: The token has a default expiration of 12 hour. If the expiresInSeconds parameter is specified during token creation, the expiration can be configured up to a maximum of 12 hours. However, the actual token validity period will always
  be the minimum of the requested expiration time and the AWS credentials' expiry time.

## Security Considerations

- **Token Expiration**: The token has a default expiration of 12 hour. If the expiresInSeconds parameter is specified during token creation, the expiration can be configured up to a maximum of 12 hours. However, the actual token validity period will always
  be the minimum of the requested expiration time and the AWS credentials' expiry time. The token must be generated again once it expires,
  as it cannot be refreshed or extended.
- **Secure Storage**: Store tokens securely and avoid logging them
- **Credential Management**: Use IAM roles and temporary credentials when possible
- **Network Security**: Always use HTTPS when transmitting tokens
- **Principle of Least Privilege**: Ensure underlying credentials have minimal required permissions

## Requirements

- **Node.js**: 16.0.0 or later
- **TypeScript**: 4.7.0 or later (for TypeScript users)

## Development

### Setting up Development Environment

```bash
# Clone the repository
git clone https://github.com/aws/aws-bedrock-token-generator-js.git
cd aws-bedrock-token-generator-js

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Format code
npm run format
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make changes and add tests**
4. **Run tests**: `npm test`
5. **Format code**: `npm run format`
6. **Submit a pull request**

## Support

- **Documentation**: [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- **Issues**: [GitHub Issues](https://github.com/aws/aws-bedrock-token-generator-js/issues)
- **AWS Support**: [AWS Support Center](https://console.aws.amazon.com/support/)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [AWS SDK for JavaScript](https://github.com/aws/aws-sdk-js-v3)
- [AWS Bedrock Token Generator for Java](https://github.com/aws/aws-bedrock-token-generator-java)
- [AWS Bedrock Token Generator for Python](https://github.com/aws/aws-bedrock-token-generator-python)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
