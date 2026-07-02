# Family Legacy Manager 🔐

A secure, self-hosted password and document management system designed for families to manage critical information and enable trusted emergency access.

## 🎯 Purpose

Store and manage:
- **Passwords**: Bank accounts, email, phones, laptops, Google accounts, investments
- **Documents**: Investment policies, insurance policies, house documents, certificates
- **Trusted Contacts**: Emergency access for family members, lawyers, executors

## ✨ Key Features

### 🔒 Military-Grade Security
- **AES-256-GCM encryption** for all sensitive data
- **PBKDF2 key derivation** (100,000 iterations)
- **Unique salt and IV** per encryption operation
- **Authentication tags** for data integrity verification
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Route protection** with authentication middleware
- **Session timeout** (30 minutes of inactivity)

### 📝 Password Management
- Store unlimited passwords with encryption
- Categories: Bank, Email, Phone, Laptop, Investment, Other
- Fields: Title, Username, Password (encrypted), URL, Notes
- **Secure reveal pattern**: Passwords only decrypted on-demand
- Audit logging for every password access

### 📄 Document Management
- Store document metadata and file information
- Categories: Investment, Insurance, House, Other
- Track: Policy numbers, amounts, premiums, maturity dates
- Encrypted file path storage
- Support for various document types

### 👨‍👩‍👧‍👦 Trusted Contacts & Emergency Access
- Designate trusted contacts (spouse, children, lawyer, executor)
- Access levels: Full, View-Only, Emergency-Only
- Configurable delay period (0-365 days)
- Emergency access request system
- Active/inactive contact management

### 📊 Audit Logging
- Track all sensitive operations
- Logs include: Action, IP address, User-Agent, timestamp
- Actions tracked: Login, password reveal, document access, emergency requests
- Full audit trail for security compliance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v4
- **Database**: Prisma ORM with PostgreSQL (Neon on Netlify)
- **Encryption**: Node.js native crypto (AES-256-GCM)
- **UI**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod
- **Sanitization**: isomorphic-dompurify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Automated Setup

```bash
# Clone the repository
git clone https://github.com/thinqfitsarath/asarynpersonalfinance.git
cd asarynpersonalfinance

# Run setup script
chmod +x setup.sh
./setup.sh

# Start the server
npm run dev
```

Open http://localhost:3000 in your browser.

### Manual Setup

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed manual setup instructions.

### What the Setup Script Does

1. ✅ Checks for Node.js installation
2. 📦 Installs all dependencies
3. 🔑 Generates secure encryption keys (NEXTAUTH_SECRET, ENCRYPTION_KEY)
4. 📄 Creates .env file with PostgreSQL configuration
5. 🗄️ Sets up database (Prisma generate + migrate)
6. 🎉 Ready to run!

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Password**: Encrypted password entries
- **Document**: Document records with metadata
- **TrustedContact**: Emergency contacts with access permissions
- **EmergencyAccess**: Emergency access requests and approvals
- **AuditLog**: Security audit trail

## 📁 Project Structure

```
asarynpersonalfinance/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── passwords/    # Password CRUD + reveal endpoint
│   │   ├── documents/    # Document management
│   │   └── trusted-contacts/ # Trusted contact management
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── passwords/    # Password management UI
│   │   ├── documents/    # Document management UI
│   │   ├── trusted-contacts/ # Trusted contacts UI
│   │   └── audit-logs/   # Audit trail viewer
│   └── layout.tsx        # Root layout with security headers
├── lib/
│   ├── utils/
│   │   ├── encryption.ts # AES-256-GCM encryption (Node.js crypto)
│   │   ├── audit.ts      # Audit logging helper
│   │   ├── request.ts    # IP/User-Agent extraction
│   │   ├── sanitize.ts   # Input sanitization (XSS prevention)
│   │   └── auth.ts       # Authentication helpers
│   └── validations/      # Zod schemas for input validation
├── prisma/
│   └── schema.prisma     # Database schema (PostgreSQL)
├── middleware.ts         # Route protection middleware
├── setup.sh              # Automated setup script
├── LOCAL_SETUP.md        # Detailed setup guide
├── SECURITY.md           # Security documentation
└── .env                  # Environment variables (DO NOT COMMIT)
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Passwords
- `GET /api/passwords` - List all passwords (metadata only, NO decrypted passwords)
- `POST /api/passwords` - Create new password
- `GET /api/passwords/[id]/reveal` - **Reveal decrypted password** (with audit logging)
- `PUT /api/passwords/[id]` - Update password
- `DELETE /api/passwords/[id]` - Delete password

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/[id]` - Get specific document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

### Trusted Contacts
- `GET /api/trusted-contacts` - List all trusted contacts
- `POST /api/trusted-contacts` - Create new contact
- `GET /api/trusted-contacts/[id]` - Get specific contact
- `PUT /api/trusted-contacts/[id]` - Update contact
- `DELETE /api/trusted-contacts/[id]` - Delete contact
- `PATCH /api/trusted-contacts/[id]` - Toggle active status

## Usage Guide

### Getting Started

1. **Register**: Create an account at `/auth/register`
2. **Login**: Sign in at `/auth/login`
3. **Dashboard**: View your overview at `/dashboard`

### Managing Passwords

1. Navigate to the Passwords section
2. Click "Add New Password"
3. Fill in the details:
   - Category (bank, email, phone, etc.)
   - Title/Account name
   - Username (optional)
   - Password
   - URL (optional)
   - Notes (optional)
4. Save - the password is encrypted before storage

### Managing Documents

1. Navigate to the Documents section
2. Click "Add New Document"
3. Fill in the details:
   - Category (investment, insurance, house, other)
   - Title
   - Provider/Company
   - Policy/Reference number
   - Amount and premium (for policies)
   - Maturity date (for investments)
   - Description/notes

### Setting Up Trusted Contacts

1. Navigate to Trusted Contacts
2. Click "Add Trusted Contact"
3. Provide:
   - Contact name
   - Email address
   - Relationship (spouse, child, lawyer, etc.)
   - Access level (full, view-only, emergency-only)
   - Delay period (days before access is granted)
4. Save the contact

### Emergency Access

When a trusted contact needs access:
1. They request access through the system
2. The request enters a waiting period (configurable delay)
3. You receive a notification
4. If you don't deny it, access is automatically granted after the delay
5. If an unfortunate event occurs, the contact can access your vault

## Security Best Practices

1. **Strong Passwords**: Use a strong, unique password for your account
2. **Regular Updates**: Keep document information current
3. **Trusted Contacts**: Only add people you completely trust
4. **Audit Logs**: Review logs periodically
5. **Backup**: Keep encrypted backups of critical data
6. **HTTPS**: Always use HTTPS in production
7. **Environment Variables**: Never commit secrets to git

## Deployment

### Production Checklist

- [ ] Set strong, random values for `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`
- [ ] Use a production PostgreSQL database
- [ ] Enable HTTPS
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Build the application: `npm run build`
- [ ] Set up regular database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

### Recommended Platforms

- **Vercel**: Easy Next.js deployment
- **Railway**: PostgreSQL + Next.js hosting
- **AWS/GCP/Azure**: Full control with managed database

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Project Structure

```
asarynpersonalfinance/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── passwords/    # Password management
│   │   ├── documents/    # Document management
│   │   └── trusted-contacts/ # Contact management
│   ├── auth/             # Auth pages (login, register)
│   ├── dashboard/        # Protected dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── utils/            # Utility functions
│   │   ├── encryption.ts # Encryption utilities
│   │   ├── session.ts    # Session management
│   │   └── cn.ts         # Class name utilities
│   └── validations/      # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
├── types/                # TypeScript type definitions
├── .env                  # Environment variables (gitignored)
├── .env.example          # Environment template
└── README.md             # This file
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists: `createdb familylegacy`

### Prisma Issues
- Regenerate client: `npx prisma generate`
- Reset database: `npx prisma migrate reset`

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## Future Enhancements

- [ ] File upload support for documents
- [ ] Two-factor authentication (2FA)
- [ ] Email notifications for emergency access requests
- [ ] Mobile app (React Native)
- [ ] Encrypted file storage with cloud sync
- [ ] Master password requirement for vault access
- [ ] Export/import functionality
- [ ] Activity dashboard with charts
- [ ] Advanced search and filtering

## Contributing

This is a private family application. For security reasons, external contributions are not accepted.

## License

Private/Proprietary - For personal use only

## Support

For issues or questions, please contact the repository owner.

---

**Important Security Note**: This application handles extremely sensitive personal and financial information. Always follow security best practices, keep your software updated, use strong passwords, and never share your credentials.
