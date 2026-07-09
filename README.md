# Dashboard UI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

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

---

# Authentication API

The Dashboard UI includes a complete authentication system with three endpoints: Login, Signup, and Password Reset. All endpoints include input validation and return appropriate HTTP status codes.

## Base URL

All authentication endpoints are available under:
```
http://localhost:3000/api/auth
```

## Endpoints

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 characters)"
}
```

**Validation Rules:**
- `email`: Must be a valid email address
- `password`: Must be at least 8 characters long

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
  ```json
  {
    "success": false,
    "error": "Validation error message"
  }
  ```
- `401 Unauthorized`: Invalid email or password
  ```json
  {
    "success": false,
    "error": "Invalid email or password"
  }
  ```
- `405 Method Not Allowed`: HTTP method not supported
  ```json
  {
    "success": false,
    "error": "Method not allowed"
  }
  ```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123!"}'
```

---

### 2. Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user with email, password, and name.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 characters)",
  "name": "string (required, min 2 characters, max 50 characters)"
}
```

**Validation Rules:**
- `email`: Must be a valid email address
- `password`: Must be at least 8 characters long and contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- `name`: Must be between 2 and 50 characters long

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data or user already exists
  ```json
  {
    "success": false,
    "error": "Validation error message or User with this email already exists"
  }
  ```
- `405 Method Not Allowed`: HTTP method not supported
  ```json
  {
    "success": false,
    "error": "Method not allowed"
  }
  ```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "Password123!", "name": "John Doe"}'
```

---

### 3. Password Reset

The password reset functionality has two phases:

#### Phase 1: Request Password Reset

**Endpoint:** `POST /api/auth/password-reset`

**Description:** Initiate a password reset by providing the user's email. A reset token is generated and would typically be sent via email (in production).

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Validation Rules:**
- `email`: Must be a valid email address

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset link has been sent",
  "token": "string (reset token for testing purposes)"
}
```

Note: In production, the `token` field would not be returned. Instead, a reset link would be emailed to the user.

**Error Responses:**
- `400 Bad Request`: Invalid input data
  ```json
  {
    "success": false,
    "error": "Validation error message"
  }
  ```
- `405 Method Not Allowed`: HTTP method not supported
  ```json
  {
    "success": false,
    "error": "Method not allowed"
  }
  ```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### Phase 2: Confirm Password Reset

**Endpoint:** `PUT /api/auth/password-reset`

**Description:** Complete the password reset using the token received in Phase 1 and the new password.

**Request Body:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 characters)",
  "confirmPassword": "string (required, must match newPassword)"
}
```

**Validation Rules:**
- `token`: Must be a valid reset token
- `newPassword`: Must be at least 8 characters long and contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- `confirmPassword`: Must match `newPassword`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data, token, or passwords don't match
  ```json
  {
    "success": false,
    "error": "Validation error message or Invalid or expired token or Passwords do not match"
  }
  ```
- `405 Method Not Allowed`: HTTP method not supported
  ```json
  {
    "success": false,
    "error": "Method not allowed"
  }
  ```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"token": "reset-token-from-email", "newPassword": "NewPassword123!", "confirmPassword": "NewPassword123!"}'
```

---

## Running Tests

The authentication system includes comprehensive tests. To run the tests:

```bash
npm test
# or
yarn test
# or
pnpm test
```

To run tests in watch mode:

```bash
npm run test:watch
# or
yarn test:watch
# or
pnpm test:watch
```

## Project Structure

```
dashboard-ui/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts
│   │       ├── signup/
│   │       │   └── route.ts
│   │       └── password-reset/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Button.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── validation.ts
├── __tests__/
│   └── auth.test.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcryptjs before storage.
2. **Input Validation**: All inputs are validated using Zod schemas.
3. **Token Expiration**: Password reset tokens expire after 1 hour.
4. **Error Messages**: Generic error messages are returned to prevent information leakage.

## Production Considerations

For production use, consider:

1. **Database**: Replace the in-memory mock database with a real database (PostgreSQL, MongoDB, etc.)
2. **Email Service**: Implement an email service to send password reset links
3. **Session Management**: Implement JWT or session-based authentication
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Store sensitive configuration in environment variables
7. **Logging**: Implement comprehensive logging for security auditing
