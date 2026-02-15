# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of SmartWatt Frontend seriously. If you've discovered a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### 🔒 Please Do NOT:

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Exploit the vulnerability

### ✅ Please DO:

**Report security vulnerabilities privately via one of these methods:**

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/JishnuPG-tech/SmartWatt-Frontend/security)
   - Click "Report a vulnerability"
   - Fill in the details

2. **Email**
   - Send details to: [Insert Security Email]
   - Subject line: `[SECURITY] Brief description`
   - Include as much detail as possible

### What to Include

Please provide:

- **Type of vulnerability** (e.g., XSS, CSRF, authentication bypass)
- **Full paths** of affected files/components
- **Location** of the vulnerable code (tag/branch/commit or URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept** (screenshots, video, or code)
- **Impact** of the vulnerability
- **Suggested fix** (if you have one)

### Example Report

```markdown
**Vulnerability Type**: Cross-Site Scripting (XSS)

**Affected Component**: Appliance name input field

**Severity**: High

**Description**:
The appliance name field does not sanitize user input, allowing
injection of malicious scripts.

**Steps to Reproduce**:
1. Navigate to Add Appliance form
2. Enter: <script>alert('XSS')</script> in name field
3. Submit form
4. Script executes on page load

**Impact**:
Attacker could steal user session data or manipulate the UI

**Suggested Fix**:
Sanitize all user inputs before rendering in the DOM
```

---

## Response Timeline

| Stage | Timeline |
|-------|----------|
| **Initial Response** | Within 48 hours |
| **Vulnerability Assessment** | Within 7 days |
| **Fix Development** | Depends on severity |
| **Patch Release** | ASAP after fix verification |
| **Public Disclosure** | After patch is widely deployed |

### Severity Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| **Critical** | < 24 hours | RCE, Authentication bypass, Sensitive data exposure |
| **High** | < 7 days | XSS, CSRF, Injection vulnerabilities |
| **Medium** | < 30 days | Information disclosure, Insecure defaults |
| **Low** | < 90 days | Minor issues, Best practice violations |

---

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest deployed version
2. **HTTPS Only**: Ensure you're accessing the site via HTTPS
3. **Secure Connections**: Don't use public Wi-Fi for sensitive operations
4. **Browser Security**: Keep your browser updated
5. **Privacy**: Don't share your session or personal data

### For Contributors

1. **Input Validation**: Always validate and sanitize user inputs
2. **XSS Prevention**: Use React's built-in XSS protection (never use `dangerouslySetInnerHTML` without sanitization)
3. **API Security**: Never expose API keys or secrets in the frontend
4. **HTTPS**: Use HTTPS for all API calls
5. **Dependencies**: Keep dependencies updated (`npm audit`)
6. **Sensitive Data**: Don't log sensitive information
7. **Error Messages**: Don't expose stack traces in production

---

## Security Features

SmartWatt Frontend includes these security measures:

- ✅ **Input Sanitization**: All user inputs are validated
- ✅ **XSS Protection**: React's built-in protection against XSS
- ✅ **HTTPS Enforcement**: All API calls use HTTPS
- ✅ **CSP Headers**: Content Security Policy configured
- ✅ **No Inline Scripts**: All scripts loaded from trusted sources
- ✅ **Secure Headers**: Security headers configured in Next.js
- ✅ **Environment Variables**: Sensitive data in env vars, not code

### Recommended Security Headers

Next.js automatically sets many security headers. Ensure these are enabled in production:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## Known Security Considerations

### 1. Client-Side Data

- All frontend data is visible to users
- Never store sensitive information in client state
- Use backend validation for all critical operations

### 2. API Key Exposure

- `NEXT_PUBLIC_*` variables are exposed to the browser
- Only use them for public APIs
- Backend handles sensitive operations

### 3. Third-Party Dependencies

- Regularly audit dependencies: `npm audit`
- Update packages with known vulnerabilities
- Review new dependencies before adding

### 4. User Input

- All user inputs are potential attack vectors
- Validate on both frontend and backend
- Sanitize before rendering or storing

---

## Third-Party Services

We use the following third-party services with security considerations:

| Service | Purpose | Security Notes |
|---------|---------|----------------|
| Vercel | Hosting | HTTPS enforced, DDoS protection |
| Supabase | Database (Optional) | Row Level Security enabled |
| Axios | HTTP Client | Request/response interceptors for auth |
| Recharts | Charts | No external data fetching |
| Plotly | Charts | Sandboxed rendering |

---

## Vulnerability Disclosure Timeline

Upon receiving a security report:

1. **Day 0**: Report received and acknowledged
2. **Day 1-7**: Vulnerability verified and assessed
3. **Day 7-30**: Patch developed and tested
4. **Day 30**: Patch released to production
5. **Day 30+**: Public disclosure (after patch deployment)

---

## Security Updates

Subscribe to security advisories:

- **GitHub Watch**: Enable security alerts for this repo
- **RSS Feed**: [Security Advisories Feed](https://github.com/JishnuPG-tech/SmartWatt-Frontend/security/advisories.atom)
- **Release Notes**: Check our releases for security patches

---

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be:

- Credited in release notes (unless anonymity requested)
- Listed in our [SECURITY_HALL_OF_FAME.md](SECURITY_HALL_OF_FAME.md)
- Eligible for acknowledgment in our documentation

---

## Questions?

For general security questions (not vulnerabilities):
- Open a [Discussion](https://github.com/JishnuPG-tech/SmartWatt-Frontend/discussions)
- Tag with `security` label

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Web Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Thank you for helping keep SmartWatt secure!** 🔒🛡️
