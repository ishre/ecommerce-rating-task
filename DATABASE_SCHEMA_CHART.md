# EcomRating Platform - Database Schema Chart

## Database Overview
The EcomRating platform uses a PostgreSQL database with three main entities: Users, Stores, and Ratings.

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │         │     Store       │         │     Rating      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ id (PK)         │◄────────┤ id (PK)         │
│ name            │         │ name            │         │ rating (1-5)    │
│ email (unique)  │         │ email (unique)  │         │ userId (FK)     │
│ password        │         │ address         │         │ storeId (FK)    │
│ address         │         │ ownerId (FK)    │         │ createdAt       │
│ role            │         │ createdAt       │         │ updatedAt       │
│ createdAt       │         │ updatedAt       │         └─────────────────┘
│ updatedAt       │         └─────────────────┘
└─────────────────┘                   ▲
         ▲                            │
         │                            │
         │                            │
         └────────────────────────────┘
```

## Detailed Schema Structure

### 1. User Table
- **Primary Key**: `id` (CUID)
- **Fields**:
  - `name`: User's full name (max 60 chars)
  - `email`: Unique email address
  - `password`: Hashed password
  - `address`: User's address (max 400 chars)
  - `role`: User role (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER)
  - `createdAt`: Account creation timestamp
  - `updatedAt`: Last update timestamp

### 2. Store Table
- **Primary Key**: `id` (CUID)
- **Fields**:
  - `name`: Store name (max 100 chars)
  - `email`: Unique store email
  - `address`: Store address (max 400 chars)
  - `ownerId`: Foreign key to User table
  - `createdAt`: Store creation timestamp
  - `updatedAt`: Last update timestamp

### 3. Rating Table
- **Primary Key**: `id` (CUID)
- **Fields**:
  - `rating`: Integer rating (1-5 scale)
  - `userId`: Foreign key to User table
  - `storeId`: Foreign key to Store table
  - `createdAt`: Rating creation timestamp
  - `updatedAt`: Last update timestamp

## Relationships

### One-to-Many Relationships
1. **User → Store**: One user can own multiple stores
2. **User → Rating**: One user can give multiple ratings
3. **Store → Rating**: One store can receive multiple ratings

### Constraints
- **Unique Constraint**: One user can only rate a store once (`@@unique([userId, storeId])`)
- **Cascade Delete**: When a user or store is deleted, related ratings are automatically removed
- **Email Uniqueness**: Both users and stores have unique email addresses

## User Roles
- **SYSTEM_ADMIN**: Platform administrators with full access
- **NORMAL_USER**: Regular users who can rate stores
- **STORE_OWNER**: Users who own stores and can manage them

## Database Features
- **Timestamps**: Automatic creation and update timestamps
- **CUID**: Collision-resistant unique identifiers
- **PostgreSQL**: Robust relational database with ACID compliance
- **Prisma ORM**: Type-safe database operations and migrations
