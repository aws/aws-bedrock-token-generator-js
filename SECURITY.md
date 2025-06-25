# Security Policy

## Reporting a Vulnerability

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public GitHub issue.

## Security Best Practices

When using this library:

- Store tokens securely and avoid logging them
- Use HTTPS when transmitting tokens
- Tokens expire after 12 hours and cannot be renewed
- Use IAM roles and temporary credentials when possible
- Follow the principle of least privilege for underlying AWS credentials
