# Security Documentation
## Family Legacy Manager

This document outlines the security measures implemented in the Family Legacy Manager application and provides guidance for maintaining security.

---

## 🔒 Security Features Implemented

### 1. **Strong Encryption (AES-256-GCM)**
- **Technology**: Node.js native `crypto` module
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Features**:
  - Unique salt per encryption
  - Unique IV (Initialization Vector) per encryption
  - Authentication tag for data integrity
  - Format: `salt:iv:authTag:encryptedData` (base64 encoded)

**Location**: `lib/utils/encryption.ts`

### 2. **Password Protection Strategy**
- **List View**: Passwords are NOT returned in API responses
- **Reveal Endpoint**: Separate authenticated endpoint `/api/passwords/[id]/reveal` required to view each password
- **Audit Logging**: Every password reveal is logged with timestamp, IP, and User-Agent
- **Client-Side**: Passwords only fetched when user explicitly clicks "Show"

**Locations**:
- API: `app/api/passwords/route.ts`, `app/api/passwords/[id]/reveal/route.ts`
- UI: `app/dashboard/passwords/page.tsx`

### 3. **Security Headers**
All responses include comprehensive security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000` | Force HTTPS for 2 years |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enable browser XSS filter |
| `Content-Security-Policy` | Restrictive | Prevent XSS/injection attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | Restrictive | Disable unnecessary browser features |

**Location**: `next.config.ts`

### 4. **Route Protection Middleware**
- **Authentication**: All `/dashboard` routes require valid session
- **Auto-redirect**: Unauthenticated users redirected to login
- **No-cache**: Sensitive pages have cache prevention headers
- **Session Validation**: JWT token verified on every request

**Location**: `middleware.ts`

### 5. **Audit Logging**
Every significant action is logged with:
- User ID
- Action type (login, create_password, reveal_password, etc.)
- Timestamp
- IP Address
- User-Agent
- Entity details
- Additional metadata

**Locations**:
- Utility: `lib/utils/audit.ts`
- Request helpers: `lib/utils/request.ts`

### 6. **Input Sanitization**
All user input is sanitized to prevent XSS attacks:
- HTML/script tags removed
- Only safe characters allowed
- URL validation
- Rich text sanitization (when needed)

**Location**: `lib/utils/sanitize.ts`

### 7. **Environment Variable Validation**
- **Startup Check**: Application refuses to start if `ENCRYPTION_KEY` is missing
- **Key Length**: Minimum 32 characters (256 bits) enforced
- **Clear Error Messages**: Helpful instructions if configuration is invalid

**Location**: `lib/utils/encryption.ts`

---

## 🔐 Environment Variables

### Required Variables

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/familylegacy"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"  # Your production domain
NEXTAUTH_SECRET="your-nextauth-secret"  # Generate: openssl rand -base64 32

# Encryption Key (CRITICAL)
ENCRYPTION_KEY="your-encryption-key"  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generating Secure Keys

**NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**ENCRYPTION_KEY**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ⚠️ CRITICAL SECURITY NOTES

1. **Never commit** `.env` files to version control
2. **Never reuse** keys across environments (dev/staging/production)
3. **Never share** encryption keys
4. **Rotate keys** periodically (requires data re-encryption)
5. **Backup keys** securely (encrypted backup recommended)

---

## 🛡️ Additional Security Recommendations

### 1. Rate Limiting (TODO)
Currently not implemented. Recommended solution:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Implement rate limiting for:
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Password reveals: 30 per minute per user
- API requests: 100 per minute per user

### 2. Two-Factor Authentication (Recommended)
Consider implementing 2FA using:
- `@simplewebauthn/server` for WebAuthn/passkeys
- `speakeasy` for TOTP (Google Authenticator)
- `twilio` for SMS-based 2FA

### 3. Database Security

**PostgreSQL Hardening**:
```sql
-- Create dedicated user with minimal permissions
CREATE USER familylegacy_app WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE familylegacy TO familylegacy_app;
GRANT USAGE ON SCHEMA public TO familylegacy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO familylegacy_app;

-- Enable SSL connections only
ALTER DATABASE familylegacy SET ssl TO 'on';
```

**Connection Security**:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 4. Session Security

Current configuration:
- **Session Duration**: 30 minutes (JWT)
- **Recommendation**: Reduce to 10-15 minutes for production
- **Auto-logout**: Implement for inactive sessions

**Location to update**: `lib/auth.ts` line 60

### 5. HTTPS Enforcement

**Production Checklist**:
- [ ] Use HTTPS only (no HTTP)
- [ ] Configure SSL/TLS certificate
- [ ] Enable HSTS (already configured)
- [ ] Use certificate from trusted CA
- [ ] Configure automatic certificate renewal

### 6. Regular Security Audits

**Monthly**:
- Review audit logs for suspicious activity
- Check for unauthorized access attempts
- Verify user accounts are legitimate
- Review trusted contacts list

**Quarterly**:
- Update all dependencies: `npm update`
- Review security patches: `npm audit`
- Test backup and recovery procedures
- Review and rotate API keys

**Annually**:
- Consider rotating encryption keys (complex, requires re-encryption)
- Full security penetration test
- Review and update security policies

---

## 🚨 Incident Response

### If You Suspect a Security Breach:

1. **Immediate Actions**:
   - Revoke all active sessions
   - Change `NEXTAUTH_SECRET` immediately
   - Lock affected user accounts
   - Review audit logs for unauthorized access

2. **Investigation**:
   - Check `AuditLog` table for suspicious activity
   - Review IP addresses and User-Agents
   - Identify scope of breach

3. **Containment**:
   - Block malicious IP addresses
   - Force password reset for affected users
   - Review and update security measures

4. **Recovery**:
   - Restore from clean backup if needed
   - Notify affected users
   - Document incident and lessons learned

5. **Prevention**:
   - Implement additional security measures
   - Update security documentation
   - Train users on security best practices

### Audit Log Queries

**View recent logins**:
```sql
SELECT * FROM "AuditLog"
WHERE action = 'login'
ORDER BY "createdAt" DESC
LIMIT 50;
```

**View password reveals**:
```sql
SELECT * FROM "AuditLog"
WHERE action = 'reveal_password'
ORDER BY "createdAt" DESC;
```

**Identify suspicious IPs**:
```sql
SELECT "ipAddress", COUNT(*) as attempts
FROM "AuditLog"
WHERE action = 'login'
  AND "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY "ipAddress"
HAVING COUNT(*) > 10;
```

---

## 📋 Security Checklist

### Pre-Production

- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Generate strong `ENCRYPTION_KEY` (32+ bytes)
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Set up database with SSL connection
- [ ] Enable database backups (encrypted)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Test authentication flow
- [ ] Test password encryption/decryption
- [ ] Review all environment variables
- [ ] Remove development/debug code
- [ ] Disable verbose error messages in production

### Post-Deployment

- [ ] Verify HTTPS is working
- [ ] Test login/logout flow
- [ ] Test password creation and reveal
- [ ] Verify audit logs are being created
- [ ] Check security headers in browser
- [ ] Perform basic penetration testing
- [ ] Set up log monitoring
- [ ] Configure automated backups
- [ ] Document incident response procedures
- [ ] Train users on security best practices

---

## 🔍 Security Testing

### Manual Testing

**Test XSS Protection**:
```javascript
// Try entering this in form fields
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```
Should be sanitized and not execute.

**Test CSRF Protection**:
Try making requests from external domain - should be blocked by NextAuth.

**Test Auth Protection**:
Try accessing `/dashboard` without logging in - should redirect to `/auth/login`.

### Automated Testing (Recommended)

```bash
# Install security testing tools
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Web Security Academy](https://portswigger.net/web-security)

---

## 📞 Reporting Security Issues

If you discover a security vulnerability, please **DO NOT** create a public GitHub issue.

Instead:
1. Do not share details publicly
2. Document the issue with steps to reproduce
3. Contact the repository owner directly
4. Allow reasonable time for fix before disclosure

---

**Last Updated**: 2025-11-25
**Version**: 1.0
**Security Level**: Production-Ready with recommended improvements
