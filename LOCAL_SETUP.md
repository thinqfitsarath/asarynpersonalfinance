# Local Setup Guide
## Family Legacy Manager

Follow these steps to run the application on your local machine.

---

## 📋 **Prerequisites**

Before you begin, make sure you have installed:

- **Node.js** (version 18 or higher)
  - Download: https://nodejs.org/
  - Check version: `node --version`

- **npm** (comes with Node.js)
  - Check version: `npm --version`

---

## 🚀 **Quick Setup (Automatic)**

### Option 1: Using the Setup Script

1. **Open Terminal** in the project folder
2. **Run the setup script:**

```bash
# On Mac/Linux:
chmod +x setup.sh
./setup.sh

# On Windows (Git Bash):
bash setup.sh
```

3. **Start the server:**
```bash
npm run dev
```

4. **Open your browser:**
   - Go to http://localhost:3000

---

## 🔧 **Manual Setup**

If the automatic script doesn't work, follow these steps:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Generate Secure Keys

**On Mac/Linux:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**On Windows (PowerShell):**
```powershell
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create .env File

Create a file named `.env` in the root directory with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<paste-your-generated-secret>"
ENCRYPTION_KEY="<paste-your-generated-key>"
```

### Step 4: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Step 5: Start the Server

```bash
npm run dev
```

### Step 6: Open in Browser

Visit: **http://localhost:3000**

---

## 🎯 **First Time Use**

1. **Register an Account**
   - Click "Get Started"
   - Enter your name, email, and password
   - Click "Create Account"

2. **Start Adding Data**
   - 🔐 **Passwords**: Bank, email, laptop passwords
   - 📄 **Documents**: Insurance policies, investments
   - 👨‍👩‍👧‍👦 **Trusted Contacts**: Emergency access contacts

---

## 🛠️ **Troubleshooting**

### Port Already in Use

If port 3000 is already taken:
```bash
npm run dev -- -p 3001
```

Then visit: http://localhost:3001

### Database Errors

Reset the database:
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Node Modules Issues

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Missing

Make sure your `.env` file exists and contains all required variables.

---

## 📚 **Available Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## 🔒 **Security Notes**

- ✅ All passwords are encrypted with AES-256-GCM
- ✅ Security headers enabled (CSP, HSTS, etc.)
- ✅ Route protection with authentication
- ✅ Audit logging for all actions
- ⚠️ **Never commit your .env file to git!**

---

## 📖 **Documentation**

For more information, see:
- **SECURITY.md** - Security features and best practices
- **README.md** - Full project documentation

---

## 💡 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Review SECURITY.md for configuration help
3. Make sure all prerequisites are installed

---

**Enjoy your secure password manager!** 🎉
