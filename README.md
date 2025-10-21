# Secure Authentication System with Next.js, Prisma, MySQL, and JWT

This project implements a secure, production-ready authentication system using Next.js 15 with App Router, Prisma ORM with MySQL, and JWT token-based authentication stored in HTTP-only cookies.

## Features

- **Secure Authentication**: JWT tokens stored in HTTP-only cookies with proper validation
- **Password Security**: Passwords are hashed using bcrypt with salt factor of 10
- **Database Integration**: MySQL database with Prisma ORM for type-safe queries
- **Docker Support**: Containerized application and database for easy deployment
- **Rate Limiting**: Protection against brute force attacks (5 attempts per minute per IP)
- **Protected Routes**: Edge Runtime middleware to restrict access to authenticated users only
- **Responsive UI**: Clean, modern interface with dark/light mode support
- **Edge Compatibility**: Special JWT handling for Edge Runtime in middleware
- **API Endpoints**:
  - Login: Authenticate users and issue JWT
  - Logout: Invalidate the authentication session
  - Signup: Register new users with validation
  - Me: Get current authenticated user info
  - Check: Lightweight authentication status verification

## Project Structure

```text
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── dashboard/        # Protected dashboard page
│   ├── signin/           # Login page
│   └── signup/           # Registration page
├── components/           # React components
│   ├── login-form.tsx    # Login form component
│   ├── signup-form.tsx   # Signup form component
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication utilities
│   │   ├── cookies.ts    # Cookie management
│   │   ├── edge-jwt.ts   # Edge-compatible JWT handling
│   │   ├── index.ts      # Main auth exports
│   │   ├── jwt.ts        # JWT token creation/verification
│   │   ├── middleware.ts # Auth middleware helpers
│   │   ├── password.ts   # Password hashing functions
│   │   └── rate-limiter.ts # Rate limiting for login attempts
│   ├── prisma/           # Database client
│   └── utils.ts          # General utilities
└── middleware.ts         # App-wide authentication middleware
```

## Getting Started

### Using Docker

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd javis-auth-challenge

# Start the Docker containers
docker-compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Local Development Setup

For local development:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd javis-auth-challenge

# Install dependencies
npm install

# Copy the example environment file and modify as needed
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## Environment Variables

For development, copy the `.env.example` file to `.env` and adjust the values as needed:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your specific configuration
nano .env  # or use your preferred editor
```

The `.env.example` file includes:

```env
# Database connection string
DATABASE_URL="mysql://root:password@localhost:3306/auth_db"

# JWT secret key (use a strong random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# JWT expiration time in seconds (default: 24 hours)
JWT_EXPIRES_IN="86400"

# Set to "production" in production environments
NODE_ENV="development"
```

For production environments, make sure to:

1. Use a strong, unique JWT secret
2. Set NODE_ENV to "production"
3. Configure a secure database connection

## Development Best Practices

### Environment Management

- Never commit `.env` files to version control
- Always use `.env.example` as a template for required variables
- For production deployments, set environment variables through your hosting platform
- Generate a new, strong JWT secret for each environment

### Database Management

- Use `prisma migrate dev` for development database migrations
- Use `prisma migrate deploy` for production database migrations
- Consider using `prisma studio` for visual database management:

  ```bash
  npx prisma studio
  ```

### Code Organization

- The project uses a modular structure with clear separation of concerns
- All authentication logic is encapsulated in `/src/lib/auth`
- API endpoints are in `/src/app/api`
- UI components are in `/src/components`

## Authentication Flow

This project implements a complete authentication flow:

1. **Registration**: Users sign up with email, password (and optional name)
2. **Login**: Users authenticate with email/password and receive a JWT token in an HTTP-only cookie
3. **Session Management**: Authentication state is maintained via HTTP-only cookies with JWT
4. **Access Control**: Protected routes require valid authentication
5. **Logout**: Invalidates the session by clearing the authentication cookie

## API Routes

### POST /api/auth/signup

Register a new user:

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name" 
}
```

Response (201 Created):

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### POST /api/auth/login

Login with credentials:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response (200 OK):

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "isAuthenticated": true
}
```

### POST /api/auth/logout

End the current session (no body required)

Response (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Get the current user's information (requires authentication)

Response (200 OK):

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2025-10-21T12:00:00.000Z"
}
```

### GET /api/auth/check

Lightweight authentication check without database query

Response (200 OK):

```json
{
  "authenticated": true,
  "userId": "user-uuid",
  "email": "user@example.com"
}
```

## Security Features

- **JWT Authentication**: Tokens are cryptographically signed and verified
- **Password Security**: Bcrypt hashing with salt factor of 10
- **HTTP-Only Cookies**: Prevents client-side JavaScript access to tokens (XSS protection)
- **Secure Cookies**: In production, cookies are only sent over HTTPS
- **Rate Limiting**: Prevents brute force attacks on login endpoints
- **Edge-Compatible Auth**: Special JWT handling for middleware in Edge Runtime
- **Input Validation**: All user inputs are validated using Zod schema
- **CSRF Protection**: SameSite cookie policy helps prevent CSRF attacks
- **Expiring Tokens**: Configurable expiration time for authentication tokens

## Tech Stack

- **Frontend**:
  - Next.js 15 with App Router
  - React 19 with hooks
  - TypeScript for type safety
  - Shadcn UI components with Tailwind CSS
  - Dark/light theme support
  
- **Backend**:
  - Next.js API Routes
  - TypeScript
  - Zod for validation
  
- **Database**:
  - MySQL
  - Prisma ORM for type-safe database access
  
- **Authentication**:
  - JWT (jsonwebtoken)
  - HTTP-only cookies
  - Edge-compatible JWT parsing
  
- **Security**:
  - Bcrypt for password hashing
  - Rate limiting with limiter package
  
- **Deployment**:
  - Docker with docker-compose
  - Environment variable management

## License

[MIT](LICENSE)
