# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   Copy `env-template.txt` to `.env` and update the values:
   ```bash
   copy env-template.txt .env
   ```
   
   Then edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ecomrating?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Sample Accounts

After running the seed script, you can use these accounts:

- **Admin**: `admin@ecomrating.com` / `AdminPass123!`
- **Store Owner**: `storeowner@ecomrating.com` / `StorePass123!`
- **Normal User**: `user@ecomrating.com` / `UserPass123!`

## Database Connection Issues?

Make sure your PostgreSQL database is running and accessible. You can test the connection with:

```bash
psql "postgresql://username:password@localhost:5432/ecomrating"
```

## Need Help?

- Check the main README.md for detailed documentation
- Ensure all environment variables are set correctly
- Verify PostgreSQL is running and accessible
- Check the console for any error messages
