# AWS Bedrock Token Generator for JavaScript/TypeScript

[![npm version](https://badge.fury.io/js/aws-bedrock-token-generator.svg)](https://badge.fury.io/js/aws-bedrock-token-generator)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/aws-bedrock-token-generator.svg)](https://nodejs.org/)

A lightweight library for generating short-term bearer tokens for AWS Bedrock API authentication.

## Features

- ✅ **Simple API**: Single method to generate bearer tokens
- ✅ **Secure**: Uses AWS SigV4 signing with 12-hour token expiration
- ✅ **Multi-region support**: Works with any AWS region where Bedrock is available
- ✅ **AWS SDK Integration**: Seamlessly works with AWS credential providers
- ✅ **Lightweight**: Minimal dependencies, focused functionality
- ✅ **Well-tested**: Comprehensive unit tests with multiple scenarios
- ✅ **TypeScript**: Full type definitions for better IDE experience

## Installation

```bash
npm install aws-bedrock-token-generator
```

## Quick Start

### Basic Usage

```typescript
import { BedrockTokenGenerator } from 'aws-bedrock-token-generator';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

async function example() {
    // Create token generator
    const generator = new BedrockTokenGenerator();
    
    // Get credentials from default provider chain
    const credentials = fromNodeProviderChain();
    
    // Generate token
    const token = await generator.generateToken(credentials, 'us-west-2');
    
    // Use the token for API calls (valid for 12 hours)
    console.log(`Bearer Token: ${token}`);
}
```

### Using with Specific Credentials

```typescript
import { BedrockTokenGenerator } from 'aws-bedrock-token-generator';

async function example() {
    const generator = new BedrockTokenGenerator();
    
    const credentials = {
        accessKeyId: 'YOUR_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
    };
    
    const token = await generator.generateToken(credentials, 'us-east-1');
}
```

### Using with Session Token

```typescript
import { BedrockTokenGenerator } from 'aws-bedrock-token-generator';

async function example() {
    const generator = new BedrockTokenGenerator();
    
    const credentials = {
        accessKeyId: 'YOUR_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
        sessionToken: 'YOUR_SESSION_TOKEN'
    };
    
    const token = await generator.generateToken(credentials, 'eu-west-1');
}
```

### Using with Different Credential Providers

```typescript
import { BedrockTokenGenerator } from 'aws-bedrock-token-generator';
import { fromInstanceMetadata, fromEnv } from '@aws-sdk/credential-providers';

async function example() {
    const generator = new BedrockTokenGenerator();
    
    // Using EC2 instance metadata
    const ec2Credentials = fromInstanceMetadata();
    const token1 = await generator.generateToken(ec2Credentials, 'us-west-2');
    
    // Using environment variables
    const envCredentials = fromEnv();
    const token2 = await generator.generateToken(envCredentials, 'us-east-1');
}
```

## API Reference

### BedrockTokenGenerator

#### Constructor

```typescript
new BedrockTokenGenerator(config?: BedrockTokenGeneratorConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `expiresIn`: Token expiration time in seconds (default: 43200 - 12 hours)

#### generateToken(credentials, region)

Generates a bearer token for AWS Bedrock API authentication.

**Parameters:**
- `credentials`: AWS credentials to use for signing
  - Must contain `accessKeyId` and `secretAccessKey`
  - May optionally contain `sessionToken`
- `region`: AWS region identifier (e.g., "us-west-2")

**Returns:**
- Promise that resolves to a bearer token string valid for 12 hours

**Throws:**
- Error if credentials or region are invalid
- AWS SDK errors for service-related issues

**Example:**
```typescript
const generator = new BedrockTokenGenerator();
const token = await generator.generateToken(credentials, "us-west-2");
```

## Token Format

The generated tokens follow this format:
```
bedrock-api-key-<base64-encoded-presigned-url>&Version=1
```

- **Prefix**: `bedrock-api-key-` identifies the token type
- **Payload**: Base64-encoded presigned URL with embedded credentials
- **Version**: `&Version=1` for future compatibility
- **Expiration**: 12 hours from generation time

## Security Considerations

- **Token Expiration**: Tokens are valid for 12 hours and cannot be renewed
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
