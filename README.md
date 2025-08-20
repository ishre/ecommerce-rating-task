# EcomRating Platform

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with Next.js, TypeScript, and PostgreSQL.

Sample Login Accounts:
'''
Admin: admin@ecomrating.com / AdminPass123!
'''
'''
Store Owner: storeowner@ecomrating.com / StorePass123!
'''
'''
Normal User: user@ecomrating.com / UserPass123!
'''
## Features

### User Roles & Functionalities

#### System Administrator
- Add new stores, normal users, and admin users
- Dashboard with total counts (users, stores, ratings)
- View and filter users and stores
- User management with role-based access control

#### Normal User
- Sign up and log in to the platform
- View list of all registered stores
- Search stores by name and address
- Submit and modify ratings (1-5 scale)
- Update password

#### Store Owner
- Log in to the platform
- View ratings submitted for their stores
- See average store ratings
- Update password

### Technical Features
- JWT-based authentication
- Role-based access control
- Form validation with client and server-side checks
- Responsive design with Tailwind CSS
- PostgreSQL database with Prisma ORM
- RESTful API endpoints
- Sorting and filtering capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt for password hashing
- **Styling**: Tailwind CSS with responsive design

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecomrating
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the environment template and update it:
   ```bash
   copy env-template.txt .env
   ```
   
   Then edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ecomrating?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database with initial data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Users Table
- `id`: Unique identifier
- `name`: User's full name (20-60 characters)
- `email`: Unique email address
- `password`: Hashed password (8-16 characters, uppercase + special char)
- `address`: User's address (max 400 characters)
- `role`: User role (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER)
- `createdAt`, `updatedAt`: Timestamps

### Stores Table
- `id`: Unique identifier
- `name`: Store name
- `email`: Store email
- `address`: Store address
- `ownerId`: Reference to store owner (User)
- `createdAt`, `updatedAt`: Timestamps

### Ratings Table
- `id`: Unique identifier
- `rating`: Rating value (1-5)
- `userId`: Reference to user who submitted rating
- `storeId`: Reference to store being rated
- `createdAt`, `updatedAt`: Timestamps

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Users (Admin only)
- `GET /api/users` - List users with filtering
- `POST /api/users` - Create new user

### Stores
- `GET /api/stores` - List stores with filtering
- `POST /api/stores` - Create new store (Admin only)

### Ratings
- `GET /api/ratings` - Get ratings for a store
- `POST /api/ratings` - Submit/update rating

### Dashboard (Admin only)
- `GET /api/dashboard` - Get dashboard statistics

## Form Validation Rules

### Name
- Minimum: 20 characters
- Maximum: 60 characters

### Email
- Must follow standard email validation rules

### Password
- Length: 8-16 characters
- Must include at least one uppercase letter
- Must include at least one special character

### Address
- Maximum: 400 characters

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── dashboard/     # Dashboard API
│   │   ├── ratings/       # Ratings API
│   │   ├── stores/        # Stores API
│   │   └── users/         # Users API
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Main dashboard page
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── AdminDashboard.tsx # Admin dashboard
│   ├── LoginForm.tsx      # Login form
│   ├── RegisterForm.tsx   # Registration form
│   ├── StoreOwnerDashboard.tsx # Store owner dashboard
│   └── UserDashboard.tsx  # Normal user dashboard
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                    # Utility libraries
│   ├── auth.ts            # Authentication utilities
│   └── db.ts              # Database connection
└── prisma/                 # Database schema and migrations
    └── schema.prisma      # Prisma schema
```

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name migration_name
```

## Security Features

- JWT tokens with expiration
- Password hashing using bcrypt
- Role-based access control
- Input validation and sanitization
- HTTP-only cookies for token storage
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

