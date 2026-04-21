# Security Review Report for App

This document outlines the security vulnerabilities, weaknesses, and architectural suggestions found during the codebase review.

## 1. Critical Vulnerabilities

### 1.1 Authentication Backdoor (Biometric Login)
- **Location:** `src/app/api/auth/biometric/route.ts`
- **Description:** The biometric login endpoint automatically queries for the first active admin/tecnico user and creates a valid session for them *without verifying any credentials or cryptographic signatures*. This is a massive backdoor. Anyone who calls this endpoint will be logged in as an administrator.
- **Fix:** Either implement a proper WebAuthn flow (verifying cryptographic signatures from the client) or disable this endpoint until it is implemented correctly. We will return a 501 Not Implemented for now.

### 1.2 Hardcoded User ID in Transactions
- **Location:** `src/app/api/finance/transactions/route.ts`
- **Description:** The transaction creation endpoint falls back to a hardcoded user ID (`df4b1335-5ff6-4703-8dcd-3e2f74fb0822`) if one is not provided in the request body. Furthermore, it trusts the `usuario_id` sent in the request payload rather than securely deriving it from the authenticated session. This allows any authenticated user to spoof transactions as another user.
- **Fix:** Extract the user ID directly from the session cookie using `extractSessionUserId()` or similar methods, and reject the request if the user is not authenticated.

## 2. Security Weaknesses & Suggestions

### 2.1 Plaintext Password Fallback
- **Location:** `src/app/api/auth/login/route.ts`
- **Description:** The login endpoint has a fallback to check for plaintext passwords if the stored hash does not start with `$2b$` (bcrypt). While this might be for legacy migration, it severely weakens security if any users still have plaintext passwords in the database.
- **Suggestion:** Force a password reset for all users who do not have a bcrypt hash. Remove the plaintext comparison logic from the codebase.

### 2.2 JWT vs Stateful Sessions
- **Location:** General authentication (`src/lib/auth-helpers.ts`, `src/middleware.ts`)
- **Description:** The application currently stores the entire user object (ID, name, email, role, etc.) as a JSON string inside a cookie.
- **Suggestion:** Instead of putting the raw JSON in the cookie, the app should use a proper JWT (JSON Web Token) signed with a secret key, or store a random session ID in the cookie and look up the session data in a database (like Redis or a dedicated session table). The current approach is susceptible to tampering since the cookie doesn't appear to be signed or encrypted before being set (except for the `httpOnly` flag).

### 2.3 Middleware Authorization Logic
- **Location:** `src/middleware.ts`
- **Description:** The middleware has hardcoded path matching and role checking logic (`isTecnicoRole`). It does not robustly check permissions for different endpoints and relies on a simplistic `sessionData.isTecnico` boolean.
- **Suggestion:** Implement a more robust Role-Based Access Control (RBAC) system. Move authorization checks closer to the resource (e.g., inside the API routes themselves) to ensure that even if the middleware is bypassed or configured incorrectly, the endpoints remain secure.

### 2.4 SQL Injection Vulnerabilities
- **Location:** Multiple files utilizing `query()` from `src/lib/db.ts`
- **Description:** Although most queries use parameterized inputs (e.g., `$1`, `$2`), the implementation relies on raw SQL strings. This increases the risk of human error leading to SQL injection. The project already has Prisma installed (`schema.prisma` exists), but the code uses a custom PostgreSQL pool connection.
- **Suggestion:** Migrate all raw SQL queries to use the Prisma ORM. This will eliminate SQL injection risks, provide type safety, and reduce boilerplate code.

### 2.5 Cross-Site Request Forgery (CSRF)
- **Location:** API Routes
- **Description:** Next.js App Router API routes do not have built-in CSRF protection. If cookies are used for authentication (which they are), state-changing API endpoints (POST, PUT, DELETE) might be vulnerable to CSRF attacks if they are accessed from a browser context without proper `SameSite` configurations or CSRF tokens.
- **Suggestion:** Ensure the `SameSite` attribute on cookies is strict enough (it's currently `lax`, which is okay but could be `strict`), and consider implementing CSRF tokens for sensitive operations.

## Conclusion

The most critical issues are the biometric backdoor and the hardcoded user ID in financial transactions. These must be addressed immediately to prevent unauthorized access and data manipulation. Afterwards, a migration to Prisma and a robust session management system (JWT or stateful sessions) should be prioritized.
