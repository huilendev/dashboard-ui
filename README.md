# Dashboard UI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Authentication API

The application includes a full authentication system with the following endpoints:

### Base URL
```
http://localhost:3000/api/auth
```

---

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 characters)"
}
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Must be at least 8 characters long

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "string",
    "email": "string"
  },
  "token": "string (JWT token)"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "message": "email: Invalid email format, password: Password must be at least 8 characters"
  }
  ```
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "success": false,
    "error": "Invalid credentials"
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

### 2. Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Create a new user account and return a JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 characters)",
  "confirmPassword": "string (optional, must match password)"
}
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Must be at least 8 characters long
- `confirmPassword`: If provided, must match `password`

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Signup successful",
  "user": {
    "id": "string",
    "email": "string"
  },
  "token": "string (JWT token)"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "message": "email: Invalid email format"
  }
  ```
- `409 Conflict`: User already exists
  ```json
  {
    "success": false,
    "error": "User already exists"
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123", "confirmPassword": "password123"}'
```

---

### 3. Password Reset

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Request a password reset token or reset password using a token.

**Two Modes:**

#### Mode 1: Request Reset Token
Send only email to receive a reset token.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "string (reset token)"
}
```

#### Mode 2: Reset Password
Send email, token, and new password to reset the password.

**Request Body:**
```json
{
  "email": "string (required)",
  "token": "string (required)",
  "newPassword": "string (required, min 8 characters)",
  "confirmPassword": "string (optional, must match newPassword)"
}
```

**Validation Rules:**
- `email`: Must be a valid email format
- `token`: Required for password reset
- `newPassword`: Must be at least 8 characters long
- `confirmPassword`: If provided, must match `newPassword`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed or invalid/expired token
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "message": "token: Reset token is required, newPassword: Password must be at least 8 characters"
  }
  ```
  or
  ```json
  {
    "success": false,
    "error": "Invalid or expired token"
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Examples:**

Request reset token:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

Reset password:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "token": "reset-token-here", "newPassword": "newpassword123"}'
```

---

### Authentication Flow

1. **Signup**: Create a new user account
2. **Login**: Authenticate and receive a JWT token
3. **Password Reset**: 
   - Request a reset token with your email
   - Use the token to set a new password

### Security Notes

- All passwords are hashed using bcrypt before storage
- JWT tokens are signed and expire after 1 hour (configurable via `JWT_EXPIRES_IN` environment variable)
- Reset tokens expire after 60 minutes
- In production, replace the in-memory database with a persistent database
- Set a strong `JWT_SECRET` environment variable in production

### Environment Variables

```
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=1h
```

### Running Tests

```bash
npm run test
# or
npm run test:watch
# or
npm run test:coverage
```
