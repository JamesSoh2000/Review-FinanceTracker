# Phase 3: Authentication System - Complete Guide for TypeScript Beginners

> **Target Audience:** This guide assumes you understand basic TypeScript (variables, functions, async/await, imports) but are new to backend authentication concepts like JWT, password hashing, and middleware.

## Table of Contents

1. [The Big Picture: Why Authentication?](#1-the-big-picture-why-authentication)
2. [Core Concepts: Building Blocks](#2-core-concepts-building-blocks)
   - Password Hashing
   - JWT (JSON Web Tokens)
   - Express Middleware
3. [Authentication Flows](#3-authentication-flows-end-to-end)
   - User Signup Flow
   - User Login Flow
   - Protected Route Access Flow
4. [File-by-File Deep Dive](#4-file-by-file-deep-dive)
   - auth.service.ts - Database Layer
   - auth.controller.ts - Business Logic Layer
   - auth.ts (routes) - Route Definitions
   - is-auth.ts - Middleware
   - tracker.ts - Integration Point
5. [How Everything Works Together](#5-how-everything-works-together)
6. [Security Best Practices Explained](#6-security-best-practices-explained)
7. [Common Pitfalls & FAQs](#7-common-pitfalls--faqs)

---

## 1. The Big Picture: Why Authentication?

### 🎯 What Problem Does Authentication Solve?

Imagine you built a finance tracking app. Without authentication:
- **Anyone** could see **anyone else's** transactions
- **Anyone** could create/delete transactions for **any user**
- You have **no idea** who is using your app

**Authentication solves this by:**
1. **Identity Verification** - Proving that a user is who they claim to be
2. **Access Control** - Ensuring users can only access their own data
3. **Personalized Experience** - Showing different data to different users

### 🔐 Real-World Analogy

Think of a hotel:
- **Registration (Signup)** - You provide ID and get a room key card
- **Check-in (Login)** - You show your ID, they verify it's you, and activate your key card
- **Room Access (Protected Routes)** - Your key card only opens YOUR room, not others' rooms
- **Key Card (JWT Token)** - This is what you carry around to prove you're a guest

### 🛡️ Security Threats Phase 3 Protects Against

| Threat | Without Auth | With Auth (Phase 3) |
|--------|-------------|-------------------|
| **Data Breach** | Anyone sees all transactions | Users only see their own data |
| **Password Theft** | Passwords stored in plain text | Passwords are hashed (irreversible) |
| **Session Hijacking** | No session management | JWT tokens expire after 1 hour |
| **Unauthorized Access** | No verification | Middleware blocks access without valid token |

---

## 2. Core Concepts: Building Blocks

### 🔒 Password Hashing

#### What is it?
**Hashing** transforms a password into a completely different string that cannot be reversed.

```typescript
// Example:
"myPassword123"  →  (bcrypt hash)  →  "$2a$12$KIXxG9..."
```

#### Why we need it?
**Never store passwords in plain text!** If your database gets hacked:
- ❌ Plain text: Hackers see `password: "myPassword123"` → They can log in as you
- ✅ Hashed: Hackers see `password_hash: "$2a$12$KIXxG9..."` → Useless! They can't reverse it

#### How bcryptjs works

```typescript
import bcrypt from 'bcryptjs';

// Hashing (during signup)
const hashedPassword = await bcrypt.hash("myPassword123", 12);
// Result: "$2a$12$KIXxG9Qz..." (different every time!)

// Verification (during login)
const isMatch = await bcrypt.compare("myPassword123", hashedPassword);
// Result: true (they match!)
```

**Key Concepts:**
- **Salt**: Random data added to password before hashing (makes each hash unique)
- **Rounds (12)**: How many times to apply the hashing algorithm (higher = more secure but slower)
- **One-Way**: You **cannot** reverse a hash back to the original password

#### Security Implications
- ⚠️ If you use **weak hashing** (like MD5): Hackers can crack it
- ✅ bcryptjs with 12 rounds: Very secure, takes CPU time to crack

---

### 🎫 JWT (JSON Web Tokens)

#### What is it?
A **JWT** is a secure way to transmit information between client and server. Think of it as a **tamper-proof ID badge**.

#### Structure of JWT
A JWT has 3 parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     HEADER                              PAYLOAD                                          SIGNATURE
```

| Part | What It Contains | Example |
|------|-----------------|---------|
| **Header** | Algorithm used (HS256) | `{"alg":"HS256","typ":"JWT"}` |
| **Payload** | User data (userId, email) | `{"userId":"123","email":"test@example.com","exp":1678900000}` |
| **Signature** | Secret-based verification | Created using JWT_SECRET |

#### How JWT Creation Works

```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
    {
        userId: user.id,      // Data to include
        email: user.email
    },
    process.env.JWT_SECRET,   // Secret key (only server knows!)
    { expiresIn: '1h' }       // Token valid for 1 hour
);

// Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi..."
```

#### How JWT Verification Works

```typescript
const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
// If valid: { userId: "123", email: "test@example.com", exp: 1678900000 }
// If invalid/expired: Throws error!
```

#### Real-World Analogy: Movie Ticket

| Movie Ticket | JWT Token |
|-------------|-----------|
| Has your name + seat number (data) | Has userId + email (payload) |
| Has theater's stamp/watermark (verification) | Has signature (created with JWT_SECRET) |
| Valid only for today (expiration) | Valid for 1 hour (expiresIn) |
| Can't be forged (theater can detect fakes) | Can't be forged (server detects tampering) |

#### Where Tokens Are Stored

| Location | Who Has It | Purpose |
|----------|-----------|---------|
| **Backend (JWT_SECRET)** | Server only | Used to create and verify tokens |
| **Frontend (localStorage)** | Client browser | Stored after login, sent with every request |

#### Security Implications
- ⚠️ If JWT_SECRET is leaked: Anyone can forge tokens
- ⚠️ Tokens sent over HTTP (not HTTPS): Can be intercepted
- ✅ Tokens expire: Even if stolen, they're useless after 1 hour
- ✅ Only signature verifies authenticity: Changing payload breaks signature

---

### 🚦 Express Middleware

#### What is it?
**Middleware** is a function that runs **before** your route handler. Think of it as a **security checkpoint**.

#### Real-World Analogy: Airport Security

```
Client Request
    ↓
🛂 Security Checkpoint (Middleware): "Show me your boarding pass (JWT)"
    ↓ (if valid)
✈️ Gate / Plane (Protected Route): "Welcome aboard!"
    ↓
Response sent back
```

#### How Middleware Chains Work in Express

```typescript
app.get('/protected-data', middleware1, middleware2, routeHandler);
//                            ↓           ↓            ↓
//                         Runs first   Runs second  Runs last
```

**The Role of `next()`:**
- `next()` - "This middleware is done, move to the next one"
- `next(error)` - "Something went wrong, skip to error handler"
- No `next()` - "Stop here, send response, don't continue"

#### Middleware Example

```typescript
const isAuth = (req, res, next) => {
    const token = req.get('Authorization');
    
    if (!token) {
        res.status(401).json({ message: 'No token!' });
        return;  // Stop here, don't call next()
    }
    
    // Token is valid, continue to next middleware/route
    next();
};

// Usage:
router.get('/transactions', isAuth, getTransactions);
//                          ↑        ↑
//                     Runs first   Runs if isAuth calls next()
```

---

## 3. Authentication Flows (End-to-End)

### 🆕 User Signup Flow

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Database
    
    Client->>Routes: POST /auth/signup<br/>{email, password}
    Routes->>Controller: signup(req, res)
    
    Controller->>Controller: Validate email & password (zod)
    
    Controller->>Service: findUserByEmail(email)
    Service->>Database: SELECT * FROM users WHERE email=?
    Database-->>Service: null (user doesn't exist)
    Service-->>Controller: null
    
    Controller->>Service: createUser(email, password)
    Service->>Service: Hash password with bcrypt (12 rounds)
    Service->>Database: INSERT INTO users (email, password_hash)
    Database-->>Service: {id: 1, email: "test@example.com"}
    Service-->>Controller: user object
    
    Controller-->>Routes: 201 Created
    Routes-->>Client: {message: "User created!", user}
```

#### Step-by-Step Breakdown:

1. **Client sends request:**
   ```json
   POST /auth/signup
   {
     "email": "james@example.com",
     "password": "myPassword123"
   }
   ```

2. **Controller validates input:**
   ```typescript
   const { email, password } = userSchema.parse(req.body);
   // If invalid format → throws ZodError → 422 response
   ```

3. **Controller checks if user exists:**
   ```typescript
   const existingUser = await authService.findUserByEmail(email);
   if (existingUser) {
       return res.status(409).json({ message: 'Email already exists.' });
   }
   ```

4. **Service hashes password:**
   ```typescript
   const hashedPassword = await bcrypt.hash(password, 12);
   // "myPassword123" → "$2a$12$KIXxG9..."
   ```

5. **Service stores user in database:**
   ```sql
   INSERT INTO users (email, password_hash) 
   VALUES ('james@example.com', '$2a$12$KIXxG9...')
   RETURNING id, email;
   ```

6. **Success response sent:**
   ```json
   201 Created
   {
     "message": "User created successfully!",
     "user": {
       "id": 1,
       "email": "james@example.com"
     }
   }
   ```

---

### 🔐 User Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Controller
    participant Service
    participant Database
    
    Client->>Routes: POST /auth/login<br/>{email, password}
    Routes->>Controller: login(req, res)
    
    Controller->>Controller: Validate email & password (zod)
    
    Controller->>Service: findUserByEmail(email)
    Service->>Database: SELECT * FROM users WHERE email=?
    Database-->>Service: {id: 1, email, password_hash: "$2a$12..."}
    Service-->>Controller: user object
    
    Controller->>Controller: bcrypt.compare(password, user.password_hash)
    Note over Controller: Verify password matches hash
    
    Controller->>Controller: jwt.sign({userId, email}, JWT_SECRET, {expiresIn: '1h'})
    Note over Controller: Create JWT token
    
    Controller-->>Routes: 200 OK
    Routes-->>Client: {token: "eyJhbGc...", userId: 1}
```

#### Step-by-Step Breakdown:

1. **Client sends credentials:**
   ```json
   POST /auth/login
   {
     "email": "james@example.com",
     "password": "myPassword123"
   }
   ```

2. **Controller validates input:**
   ```typescript
   const { email, password } = userSchema.parse(req.body);
   ```

3. **Service finds user in database:**
   ```typescript
   const user = await authService.findUserByEmail(email);
   if (!user) {
       return res.status(401).json({ message: 'Invalid credentials.' });
   }
   // Returns: {id: 1, email: "james@example.com", password_hash: "$2a$12..."}
   ```

4. **Controller verifies password:**
   ```typescript
   const isEqual = await bcrypt.compare(password, user.password_hash);
   // Compares "myPassword123" with "$2a$12..."
   if (!isEqual) {
       return res.status(401).json({ message: 'Invalid credentials.' });
   }
   ```

5. **Controller creates JWT token:**
   ```typescript
   const token = jwt.sign(
       { userId: user.id, email: user.email },  // Payload
       process.env.JWT_SECRET,                   // Secret key
       { expiresIn: '1h' }                       // Expiration
   );
   // Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiamFtZXNAZXhhbXBsZS5jb20iLCJpYXQiOjE2Nzg5MDAwMDAsImV4cCI6MTY3ODkwMzYwMH0.signature"
   ```

6. **Success response with token:**
   ```json
   200 OK
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "userId": 1
   }
   ```

7. **Client stores token:**
   ```javascript
   localStorage.setItem('token', token);
   // Now client can send this token with future requests
   ```

---

### 🛡️ Protected Route Access Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Route Handler
    participant Database
    
    Client->>Middleware: GET /feed/transactions<br/>Authorization: Bearer eyJhbGc...
    
    Middleware->>Middleware: Extract token from Authorization header
    Note over Middleware: token = authHeader.split(' ')[1]
    
    Middleware->>Middleware: jwt.verify(token, JWT_SECRET)
    
    alt Token is valid
        Middleware->>Middleware: Attach userId to request object
        Note over Middleware: req.userId = decodedToken.userId
        Middleware->>Route Handler: next() - Allow request to proceed
        Route Handler->>Database: SELECT * FROM transactions WHERE user_id = req.userId
        Database-->>Route Handler: [user's transactions]
        Route Handler-->>Client: 200 OK + transactions
    else Token is invalid/expired
        Middleware-->>Client: 401 Unauthorized<br/>{message: "Not authenticated"}
    end
```

#### Step-by-Step Breakdown:

1. **Client sends request with JWT:**
   ```http
   GET /feed/transactions
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Middleware intercepts request:**
   ```typescript
   const authHeader = req.get('Authorization');
   // Result: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Middleware extracts token:**
   ```typescript
   const token = authHeader.split(' ')[1];
   // Splits "Bearer TOKEN" → ["Bearer", "TOKEN"]
   // Takes second element → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

4 **Middleware verifies token:**
   ```typescript
   const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
   // If valid: { userId: 1, email: "james@example.com", iat: 1678900000, exp: 1678903600 }
   // If invalid: Throws error!
   ```

5. **Middleware attaches userId to request:**
   ```typescript
   req.userId = decodedToken.userId;  // Now req.userId = 1
   next();  // Allow request to continue
   ```

6. **Route handler uses userId:**
   ```typescript
   const transactions = await query(
       'SELECT * FROM transactions WHERE user_id = $1',
       [req.userId]  // Only get THIS user's data!
   );
   ```

7. **Response sent:**
   ```json
   200 OK
   {
     "transactions": [
       { "id": 1, "amount": 50, "user_id": 1, ... },
       { "id": 2, "amount": 100, "user_id": 1, ... }
     ]
   }
   ```

---

## 4. File-by-File Deep Dive

### 📄 File 1: `auth.service.ts` - Database Layer

**Purpose:** Handle all direct database operations for user management.

#### Full Code with Line-by-Line Explanation:

```typescript
// 1. Import the database query function from db.ts
import { query } from '../db_conn/db';

// 2. Import bcryptjs for password hashing
import bcrypt from 'bcryptjs';

// 3. FUNCTION: createUser
//    Purpose: Create a new user in the database with hashed password
//    Parameters: email (string), password (string)
//    Returns: User object {id, email}
export const createUser = async (email: string, password: string) => {
    // 4. Hash the password using bcrypt with 12 salt rounds
    //    This converts "myPassword123" → "$2a$12$KIXxG9..."
    //    The '12' means the algorithm runs 2^12 = 4096 iterations
    //    Higher number = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 5. Insert new user into database
    //    $1, $2 are placeholders (prevents SQL injection)
    //    RETURNING clause makes PostgreSQL return the created row
    const result = await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]  // Values to replace $1 and $2
    );
    
    // 6. Return the first (and only) row from result
    //    Format: { id: 1, email: "james@example.com" }
    //    Note: password_hash is NOT returned (security!)
    return result.rows[0];
};

// 7. FUNCTION: findUserByEmail
//    Purpose: Look up a user by their email address
//    Parameters: email (string)
//    Returns: User object {id, email, password_hash} or undefined
export const findUserByEmail = async (email: string) => {
    // 8. Query database for user with matching email
    //    This DOES return password_hash (needed for login verification)
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    
    // 9. Return first row (or undefined if no user found)
    return result.rows[0];
};
```

#### Key Patterns Used:

1. **Separation of Concerns:**
   - Service layer only talks to database
   - Doesn't know about HTTP requests/responses
   - Can be reused in different contexts

2. **SQL Parameterization:**
   ```typescript
   // ❌ BAD (SQL injection vulnerable):
   query(`SELECT * FROM users WHERE email = '${email}'`)
   
   // ✅ GOOD (safe from SQL injection):
   query('SELECT * FROM users WHERE email = $1', [email])
   ```

3. **RETURNING clause:**
   ```sql
   -- Without RETURNING: INSERT runs, but you don't get the new user's ID
   INSERT INTO users (email, password_hash) VALUES ($1, $2)
   
   -- With RETURNING: You get back the created row
   INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email
   ```

#### Error Handling:
- If database connection fails → `query()` throws error
- Error propagates up to controller → caught by try/catch
- Controller sends appropriate HTTP error response

---

### 📄 File 2: `auth.controller.ts` - Business Logic Layer

**Purpose:** Handle authentication business logic and orchestrate between routes and services.

#### Full Code with Line-by-Line Explanation:

```typescript
// 1-5: Imports
import { Request, Response, NextFunction } from 'express';  // TypeScript types
import bcrypt from 'bcryptjs';      // For password comparison
import jwt from 'jsonwebtoken';      // For creating JWT tokens
import { z } from 'zod';            // For request validation
import * as authService from '../services/auth.service';  // Database operations

// 6-10: Define validation schema using Zod
//       This ensures email and password have correct format
const userSchema = z.object({
    email: z.string().email(),        // Must be valid email format
    password: z.string().min(6),      // Must be at least 6 characters
});
// Example valid data: { email: "test@example.com", password: "myPass123" }
// Example invalid: { email: "notanemail", password: "123" } → ZodError

// 12-28: FUNCTION: signup
//        Purpose: Create a new user account
//        Parameters: req (request), res (response), next (error handler)
export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 14: Validate request body using Zod schema
        //     If invalid → throws ZodError → caught by catch block
        const { email, password } = userSchema.parse(req.body);

        // 16-19: Check if email already exists
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            // 409 = Conflict status code (resource already exists)
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // 21-22: Create new user (password gets hashed in service layer)
        const user = await authService.createUser(email, password);
        // user = { id: 1, email: "james@example.com" }
        
        // 201 = Created status code
        return res.status(201).json({ 
            message: 'User created successfully!', 
            user 
        });

    } catch (error) {
        // 24-27: If any error occurs, pass it to Express error handler
        //        (defined in tracker.ts)
        next(error);
        return;
    }
};

// 30-64: FUNCTION: login
//        Purpose: Authenticate user and return JWT token
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 32: Validate request body
        const { email, password } = userSchema.parse(req.body);

        // 34-37: Find user by email
        const user = await authService.findUserByEmail(email);
        if (!user) {
            // 401 = Unauthorized
            // Note: Same message for "user not found" and "wrong password"
            //       This prevents attackers from knowing which emails exist
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 39-42: Compare provided password with stored hash
        const isEqual = await bcrypt.compare(password, user.password_hash);
        // Example: bcrypt.compare("myPassword123", "$2a$12$KIXxG9...")
        //          Returns true if they match, false otherwise
        if (!isEqual) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 44-47: Get JWT secret from environment variables
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // This should never happen in production
            // But it's good defensive programming
            throw new Error('JWT_SECRET is not set in environment variables.');
        }

        // 49-56: Create JWT token
        const token = jwt.sign(
            {
                // PAYLOAD: Data stored in the token
                userId: user.id,
                email: user.email,
            },
            secret,                     // SECRET: Used to sign the token
            { expiresIn: '1h' }         // OPTIONS: Token expires in 1 hour
        );
        // Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiamFtZXNAZXhhbXBsZS5jb20iLCJpYXQiOjE2Nzg5MDAwMDAsImV4cCI6MTY3ODkwMzYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

        // 58: Send token to client
        return res.status(200).json({ 
            token,            // Client will store this and send with future requests
            userId: user.id   // Optional: client might want to display user info
        });
        
    } catch (error) {
        // 60-63: Error handling
        next(error);
        return;
    }
};
```

#### Key Patterns Used:

1. **Request Validation with Zod:**
   ```typescript
   // Catches bad data BEFORE it reaches your logic
   const { email, password } = userSchema.parse(req.body);
   // If req.body = { email: "invalid", password: "12" }
   // →throws ZodError → caught by catch block → 422 response
   ```

2. **Defensive Error Handling:**
   ```typescript
   // Always check if user exists before accessing properties
   if (!user) {
       return res.status(401).json({ message: 'Invalid credentials.' });
   }
   // Now TypeScript knows 'user' is not undefined below this line
   ```

3. **Security-Conscious Error Messages:**
   ```typescript
   // ❌ BAD: Reveals which emails exist in your database
   if (!user) return res.json({ message: 'Email not found' });
   if (!isEqual) return res.json({ message: 'Wrong password' });
   
   // ✅ GOOD: Same message for both cases
   if (!user || !isEqual) return res.json({ message: 'Invalid credentials.' });
   ```

4. **Environment Variable Checks:**
   ```typescript
   if (!secret) {
       throw new Error('JWT_SECRET is not set in environment variables.');
   }
   // Fail fast if configuration is wrong
   ```

---

### 📄 File 3: `auth.ts` (routes) - Route Definitions

**Purpose:** Define the HTTP endpoints for authentication.

#### Full Code with Explanation:

```typescript
// 1: Import Express router
import express from 'express';

// 2: Import controller functions
import * as authController from '../controllers/auth.controller';

// 4: Create a new router instance
//    A router is like a mini Express app for a specific path
const router = express.Router();

// 6: Define POST /signup endpoint
//    When someone sends: POST /auth/signup
//    Express calls: authController.signup(req, res, next)
router.post('/signup', authController.signup);

// 8: Define POST /login endpoint
//    When someone sends: POST /auth/login
//    Express calls: authController.login(req, res, next)
router.post('/login', authController.login);

// 10: Export router so tracker.ts can use it
export default router;
```

#### How This Router Gets Used:

In `tracker.ts`:
```typescript
import authRoutes from './routes/auth';

app.use('/auth', authRoutes);
//       ↑           ↑
//    Base path   All routes from auth.ts
```

This creates these endpoints:
- `POST /auth/signup` → calls `authController.signup`
- `POST /auth/login` → calls `authController.login`

#### Request Flow:

```
Client Request: POST /auth/signup
       ↓
tracker.ts: app.use('/auth', authRoutes)
       ↓
auth.ts: router.post('/signup', authController.signup)
       ↓
auth.controller.ts: export const signup = async (req, res, next) => { ... }
       ↓
auth.service.ts: createUser(email, password)
       ↓
Database: INSERT INTO users ...
```

---

### 📄 File 4: `is-auth.ts` - JWT Verification Middleware

**Purpose:** Protect routes by verifying JWT tokens before allowing access.

#### Full Code with Line-by-Line Explanation:

```typescript
// 1-2: Import types from Express
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 4-6: Extend Express Request type to include userId
//      By default, Request doesn't have a userId property
//      We add it so routes can access the authenticated user's ID
interface AuthenticatedRequest extends Request {
    userId?: string;  // Optional because it's only set after auth
}

// 8: Export the middleware function
//    Middleware signature: (req, res, next) => void
export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 9: Get Authorization header from request
    //    Expected format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.get('Authorization');
    
    // 10-13: Check if Authorization header exists
    if (!authHeader) {
        // No header → User is not authenticated
        res.status(401).json({ message: 'Not authenticated.' });
        return;  // Stop here, don't call next()
    }
    
    // 14: Extract token from header
    //     "Bearer TOKEN" → ["Bearer", "TOKEN"]
    //     split(' ')[1] takes the second element
    const token = authHeader.split(' ')[1];
    
    // 15: Variable to store decoded token
    let decodedToken;
    
    // 16-25: Try to verify the token
    try {
        // 17-20: Get JWT secret from environment
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not set in environment variables.');
        }
        
        // 21: Verify token using JWT secret
        //     If token is valid:
        //       decodedToken = { userId: 1, email: "james@example.com", iat: ..., exp: ... }
        //     If token is invalid/expired/tampered:
        //       Throws error
        decodedToken = jwt.verify(token, secret);
        
    } catch (err) {
        // 22-25: Token verification failed
        //        Could be: expired, invalid signature, malformed, etc.
        res.status(500).json({ message: 'Token verification failed.' });
        return;  // Stop here
    }
    
    // 26-29: Double-check decoded token is an object
    //        (jwt.verify could theoretically return a string)
    if (!decodedToken || typeof decodedToken !== 'object') {
        res.status(401).json({ message: 'Not authenticated.' });
        return;
    }
    
    // 30: Attach userId to request object
    //     Now any route handler after this middleware can access req.userId
    req.userId = (decodedToken as { userId: string }).userId;
    
    // 31: Call next() to pass control to the next middleware/route handler
    next();
    return;
};
```

#### How This Middleware Is Used:

In `feed.ts`:
```typescript
import isAuth from '../middleware/is-auth';

// Protected route: middleware runs BEFORE feedController.getTransactions
router.get('/list-expenses', isAuth, feedController.getExpenseTable);
//                            ↑               ↑
//                       Runs first      Runs second (if isAuth calls next())
```

#### Request Flow with Middleware:

```mermaid
graph TD
    A[Client sends GET /feed/list-expenses] --> B[isAuth middleware]
    B --> C{Token valid?}
    C -->|Yes| D[Set req.userId]
    D --> E[Call next]
    E --> F[feedController.getExpenseTable]
    F --> G[Query database with req.userId]
    G --> H[Return user's expenses]
    
    C -->|No| I[Send 401 Unauthorized]
    I --> J[Stop - don't call next]
```

#### Key Patterns:

1. **Early Return Pattern:**
   ```typescript
   if (!authHeader) {
       res.status(401).json({ message: 'Not authenticated.' });
       return;  // STOP HERE - don't continue
   }
   // Code below only runs if authHeader exists
   ```

2. **Request Augmentation:**
   ```typescript
   // Middleware adds data to request object
   req.userId = decodedToken.userId;
   
   // Later, in route handler:
   const userId = req.userId;  // Available!
   ```

3. **Authorization Header Format:**
   ```
   Authorization: Bearer <token>
                  ↑      ↑
               Scheme   Token
   ```

---

### 📄 File 5: `tracker.ts` - Integration Point

**Purpose:** Main Express application that ties everything together.

#### Relevant Code Sections:

```typescript
// 1-4: Imports
import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { z } from 'zod';

// 6-7: Import route modules
import feedRoutes from './routes/feed';
import authRoutes from './routes/auth';

// 9: Set port (use environment variable or default to 8000)
const port = process.env.PORT || 8000;

// 11: Create Express application
const app: Express = express();

// 13-18: Configure CORS (Cross-Origin Resource Sharing)
//        This allows frontend (running on different port) to call backend
app.use(cors({
    origin: "*",  // Allow requests from any origin (in production, restrict this!)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// 20: Parse JSON request bodies
//     Without this, req.body would be undefined
app.use(bodyParser.json());

// 22-23: Register route modules
app.use('/auth', authRoutes);
//       ↑         ↑
//    All requests to /auth/*  →  Handled by authRoutes
//    Example: POST /auth/signup → authRoutes handles it

app.use('/feed', feedRoutes);
//       ↑         ↑
//    All requests to /feed/*  →  Handled by feedRoutes
//    Example: GET /feed/transactions → feedRoutes handles it

// 25-40: Global error handler middleware
//        This catches errors from all routes
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);  // Log error for debugging

    // 28-34: Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
        res.status(422).json({ 
            message: 'Validation failed.',
            errors: error.errors  // Detailed validation error info
        });
        return;
    }
    
    // 36-38: Handle all other errors
    const status = error.statusCode || 500;  // Use custom status or default to 500
    const message = error.message || 'An internal server error occurred.';
    res.status(status).json({ message: message });
    return;
});

// 42-44: Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

#### How Routes Are Registered:

```typescript
app.use('/auth', authRoutes);

// This creates these endpoints:
// POST /auth/signup  → authRoutes → router.post('/signup', ...)
// POST /auth/login   → authRoutes → router.post('/login', ...)
```

```typescript
app.use('/feed', feedRoutes);

// This creates these endpoints:
// GET /feed/transactions       → feedRoutes → router.get('/transactions', isAuth, ...)
// GET /feed/financial-overview → feedRoutes → router.get('/financial-overview', isAuth, ...)
// etc.
```

---

## 5. How Everything Works Together

### 🏗️ Architecture Diagram

```mermaid
graph TB
    subgraph "Client (Frontend)"
        A[React App]
    end
    
    subgraph "Server (Backend)"
        B[tracker.ts<br/>Main App]
        
        subgraph "Routes Layer"
            C[auth.ts<br/>Route Definitions]
            D[feed.ts<br/>Route Definitions]
        end
        
        subgraph "Middleware"
            E[is-auth.ts<br/>JWT Verification]
        end
        
        subgraph "Controllers Layer"
            F[auth.controller.ts<br/>Business Logic]
            G[feed.controller.ts<br/>Business Logic]
        end
        
        subgraph "Services Layer"
            H[auth.service.ts<br/>Database Operations]
            I[feed.service.ts<br/>Database Operations]
        end
        
        J[db.ts<br/>PostgreSQL Connection]
    end
    
    subgraph "Database"
        K[(PostgreSQL)]
    end
    
    A -->|HTTP Request| B
    B --> C
    B --> D
    C --> F
    D --> E
    E --> G
    F --> H
    G --> I
    H --> J
    I --> J
    J --> K
    
    style E fill:#ffebee
    style F fill:#e3f2fd
    style G fill:#e3f2fd
    style H fill:#f3e5f5
    style I fill:#f3e5f5
```

### 📊 Layered Architecture

```
┌─────────────────────────────────────────┐
│         Routes Layer                     │  Defines HTTP endpoints
│  (auth.ts, feed.ts)                     │  Maps URLs to controllers
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Middleware Layer                 │  Intercepts requests
│  (is-auth.ts, CORS, body-parser)        │  Validates, authenticates
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Controllers Layer                │  Business logic
│  (auth.controller.ts, feed.controller)  │  Request validation
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼──────────────────────┐
│         Services Layer                  │  Database operations
│  (auth.service.ts, feed.service.ts)    │  Data transformations
└─────────────────┬──────────────────────┘
                  │
┌─────────────────▼──────────────────────┐
│         Database Layer                  │  PostgreSQL connection
│  (db.ts)                                │  Query execution
└─────────────────────────────────────────┘
```

### 🔄 Complete Request/Response Flow

#### Example: User logs in and fetches transactions

```mermaid
sequenceDiagram
    participant Client
    participant tracker.ts
    participant auth.ts
    participant auth.controller
    participant auth.service
    participant Database
    participant feed.ts
    participant is-auth
    participant feed.controller
    
    rect rgb(255, 240, 240)
        Note over Client,Database: STEP 1: User Login
        Client->>tracker.ts: POST /auth/login {email, password}
        tracker.ts->>auth.ts: Route to /login handler
        auth.ts->>auth.controller: Call login(req, res, next)
        auth.controller->>auth.service: findUserByEmail(email)
        auth.service->>Database: SELECT * FROM users WHERE email=?
        Database-->>auth.service: user object
        auth.service-->>auth.controller: user object
        auth.controller->>auth.controller: Verify password + create JWT
        auth.controller-->>Client: 200 OK {token, userId}
        Note over Client: Store token in localStorage
    end
    
    rect rgb(240, 255, 240)
        Note over Client,feed.controller: STEP 2: Fetch Transactions (with token)
        Client->>tracker.ts: GET /feed/list-expenses<br/>Authorization: Bearer TOKEN
        tracker.ts->>feed.ts: Route to /list-expenses handler
        feed.ts->>is-auth: isAuth middleware runs first
        is-auth->>is-auth: Verify JWT token
        is-auth->>is-auth: Set req.userId from token
        is-auth->>feed.controller: next() - proceed to controller
        feed.controller->>Database: SELECT * WHERE user_id = req.userId
        Database-->>feed.controller: user's transactions
        feed.controller-->>Client: 200 OK [transactions]
    end
```

### 🧩 File Dependency Graph

```mermaid
graph LR
    A[tracker.ts] --> B[auth.ts]
    A --> C[feed.ts]
    
    B --> D[auth.controller.ts]
    C --> E[is-auth.ts]
    C --> F[feed.controller.ts]
    
    D --> G[auth.service.ts]
    F --> H[feed.service.ts]
    E --> I[jsonwebtoken]
    
    G --> J[db.ts]
    H --> J
    G --> K[bcryptjs]
    D --> K
    D --> L[zod]
    
    J --> M[(PostgreSQL)]
    
    style A fill:#ffcdd2
    style B fill:#f8bbd0
    style C fill:#f8bbd0
    style D fill:#e1bee7
    style E fill:#fff9c4
    style F fill:#e1bee7
    style G fill:#c5cae9
    style H fill:#c5cae9
    style J fill:#b2dfdb
```

**Dependency Explanation:**
- `tracker.ts` imports and uses `auth.ts` and `feed.ts`
- `auth.ts` imports `auth.controller.ts`
- `feed.ts` imports `is-auth.ts` middleware and `feed.controller.ts`
- Controllers import services
- Services import `db.ts` and utility libraries
- `db.ts` connects to PostgreSQL

---

## 6. Security Best Practices Explained

### 🔐 1. Environment Variables for Secrets

**What the code does:**
```typescript
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables.');
}
```

**Why this is secure:**
- ✅ JWT_SECRET never appears in code (can't leak via Git)
- ✅ Different secrets for development/production
- ✅ Secret can be rotated without code changes

**What should be in `.env` file:**
```
JWT_SECRET=your_super_secret_key_here_min_32_chars
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
PORT=8000
```

**❌ Bad Practice:**
```typescript
// NEVER DO THIS!
const secret = "hardcoded_secret_123";  // Now it's in Git history!
```

---

### ⏰ 2. Token Expiration

**What the code does:**
```typescript
const token = jwt.sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn: '1h' }  // Token expires in 1 hour
);
```

**Why this matters:**
- ✅ If token is stolen, it's only valid for 1 hour
- ✅ Forces periodic re-authentication
- ✅ Reduces impact of token theft

**Common expiration times:**
- Short-lived: `'15m'` (15 minutes) - Very secure, but annoying for users
- Medium: `'1h'` (1 hour) - Good balance (used in this project)
- Long: `'7d'` (7 days) - Convenient, but riskier

**Token expiration is automatic:**
```typescript
// Token created at 12:00 PM with expiresIn: '1h'
// At 1:01 PM, jwt.verify() will throw error: "jwt expired"
```

---

### 🔒 3. Password Hashing with Strong Salt Rounds

**What the code does:**
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
//                                                  ↑
//                                          12 salt rounds
```

**Why 12 rounds?**
- Each round doubles the time to compute
- 12 rounds ≈ 4096 iterations (2^12)
- Makes brute-force attacks very slow

**Trade-offs:**
| Rounds | Time to Hash | Security | Recommendation |
|--------|-------------|----------|----------------|
| 8 | ~40ms | Low | ❌ Too fast, vulnerable to brute-force |
| 10 | ~100ms | Medium | ⚠️ Minimum for modern apps |
| 12 | ~250ms | High | ✅ Good balance (used in this project) |
| 14 | ~1 second | Very High | ⚠️ May be too slow for high-traffic apps |

---

### 🕵️ 4. Not Revealing User Existence

**What the code does:**
```typescript
const user = await authService.findUserByEmail(email);
if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
}

const isEqual = await bcrypt.compare(password, user.password_hash);
if (!isEqual) {
    return res.status(401).json({ message: 'Invalid credentials.' });
}
// Same message for both cases!
```

**Why this is secure:**

❌ **Bad Practice:**
```typescript
if (!user) {
    return res.json({ message: 'Email not found' });
}
if (!isEqual) {
    return res.json({ message: 'Wrong password' });
}
```
**Problem:** Attacker can enumerate emails in your database:
1. Try `hacker@evil.com` → "Email not found" → Not a user
2. Try `james@example.com` → "Wrong password" → IS a user! (Now try password brute-force)

✅ **Good Practice:**
```typescript
// Always return "Invalid credentials" regardless of reason
if (!user || !is Equal) {
    return res.status(401).json({ message: 'Invalid credentials.' });
}
```

---

### 📋 5. HTTP Status Codes

**Status codes used in auth system:**

| Code | Meaning | When Used in Code |
|------|---------|------------------|
| **200** | OK | Successful login |
| **201** | Created | User signup successful |
| **401** | Unauthorized | Invalid credentials, missing/invalid token |
| **409** | Conflict | Email already exists (signup) |
| **422** | Unprocessable Entity | Validation failed (Zod errors) |
| **500** | Internal Server Error | Token verification failed, database errors |

**Example from code:**
```typescript
// 201: User created
return res.status(201).json({ message: 'User created successfully!', user });

// 409: Email already exists
if (existingUser) {
    return res.status(409).json({ message: 'Email already exists.' });
}

// 401: Bad credentials
if (!user || !isEqual) {
    return res.status(401).json({ message: 'Invalid credentials.' });
}
```

---

### 🌐 6. CORS Configuration

**What the code does (in tracker.ts):**
```typescript
app.use(cors({
    origin: "*",  // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
```

**What this means:**
- `origin: "*"` - Accept requests from ANY website
- This is OK for development
- ⚠️ **In production, restrict this!**

**Better production configuration:**
```typescript
app.use(cors({
    origin: "https://yourfrontend.com",  // Only allow your frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true  // Allow cookies/auth headers
}));
```

**Why CORS matters for auth:**
- Prevents malicious websites from calling your API
- Controls which origins can send JWT tokens
- Part of browser security model

---

## 7. Common Pitfalls & FAQs

### ❓ What happens if JWT_SECRET is missing?

**Code check:**
```typescript
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables.');
}
```

**Answer:**
- The server **throws an error** immediately
- **Login fails** with 500 status
- This is **by design** - fail fast instead of using a weak/undefined secret

**How to fix:**
1. Create a `.env` file in the `backend/` directory
2. Add: `JWT_SECRET=your_secret_key_at_least_32_characters_long`
3. Restart the server

---

### ❓ Why use status `401` for both "user not found" and "wrong password"?

**Answer:** Security! See [Security Best Practice #4](#-4-not-revealing-user-existence)

If you reveal which error it is:
- Attackers can enumerate valid emails
- Then focus brute-force attacks on known emails
- Makes attacks 50% more efficient

---

### ❓ Can tokens be refreshed?

**Current implementation:** No. Tokens expire after 1 hour and must be re-obtained by logging in again.

**How to add refresh tokens (future enhancement):**

1. **Issue two tokens:**
   - **Access token** (short-lived, 15 min) - Used for API requests
   - **Refresh token** (long-lived, 7 days) - Used to get new access tokens

2. **Add refresh endpoint:**
   ```typescript
   router.post('/refresh', authController.refreshToken);
   ```

3. **Store refresh tokens in database:**
   - Allows server to invalidate tokens (logout)
   - Track active sessions

---

### ❓ Where should tokens be stored on the frontend?

**Options:**

| Storage | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **localStorage** | Simple, persists across tabs | Vulnerable to XSS attacks | ⚠️ OK for learning projects |
| **sessionStorage** | Cleared when tab closes | Lost on tab close, still vulnerable to XSS | ❌ Not recommended |
| **httpOnly Cookie** | Not accessible to JavaScript (XSS-proof) | Requires backend changes, vulnerable to CSRF | ✅ Best for production |
| **Memory only** | Cleared on page refresh | User gets logged out on refresh | ❌ Bad UX |

**Current frontend code likely does:**
```typescript
// After successful login:
localStorage.setItem('token', token);

// When making requests:
const token = localStorage.getItem('token');
fetch('/feed/transactions', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

### ❓ What happens when a token expires?

**Scenario:**
1. User logs in at 12:00 PM → Gets token (expires at 1:00 PM)
2. User makes requests at 12:30 PM → Everything works
3. User makes request at 1:05 PM → **Token expired!**

**What happens in code:**
```typescript
// In is-auth.ts middleware:
try {
    decodedToken = jwt.verify(token, secret);
} catch (err) {
    // jwt.verify throws "TokenExpiredError"
    res.status(500).json({ message: 'Token verification failed.' });
    return;
}
```

**Frontend should:**
1. Catch **401** or **500** response
2. Detect expired token
3. Redirect user to login page
4. Show message: "Session expired, please log in again"

---

### ❓ What if I change JWT_SECRET after users have logged in?

**Answer:**
- **All existing tokens become invalid** immediately
- jwt.verify() will fail (signature won't match)
- All users will be logged out
- They'll need to log in again with new credentials

**When to rotate JWT_SECRET:**
- Security breach / suspected leak
- Periodic rotation (every 6 months)
- Before deploying to production (don't use dev secret!)

---

### ❓ Can two users have the same email?

**Answer:** No.

**Why:**
```typescript
// In auth.controller.ts signup function:
const existingUser = await authService.findUserByEmail(email);
if (existingUser) {
    return res.status(409).json({ message: 'Email already exists.' });
}
```

**Best practice is also to add database constraint:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,  -- UNIQUE constraint!
    password_hash TEXT NOT NULL
);
```

---

### ❓ Why does middleware need `next()`?

**Answer:** To pass control to the next function in the chain.

**Visual explanation:**
```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
             ↓              ↓              ↓
          next()         next()       res.json()
```

**Without `next()`:**
```typescript
app.get('/data', isAuth, getData);
//                ↑        ↑
//           If isAuth doesn't call next(), getData NEVER runs!

const isAuth = (req, res, next) => {
    if (!token) {
        res.status(401).json({ message: 'No token' });
        // No next() called! Request stops here.
        return;
    }
    next();  // NOW getData() will run
};
```

---

## 🎯 Conclusion & Next Steps

### What You've Learned

After completing this guide, you now understand:

✅ **Why authentication is critical** for multi-user applications
✅ **How password hashing protects** user credentials
✅ **What JWT tokens are** and how they work
✅ **What middleware does** in Express
✅ **How the layers connect** (Routes → Controllers → Services → Database)
✅ **Security best practices** and why they matter
✅ **How to trace a request** from client to database and back

### Phase 3 Files Recap

| File | Purpose | Key Responsibility |
|------|---------|-------------------|
| `auth.ts` | Route definitions | Maps `/auth/signup` and `/auth/login` to controllers |
| `auth.controller.ts` | Business logic | Validates requests, creates JWT tokens |
| `auth.service.ts` | Database operations | Hashes passwords, queries users table |
| `is-auth.ts` | Middleware | Verifies JWT tokens, protects routes |
| `tracker.ts` | Integration | Registers routes and error handlers |

### Can You Now...?

Test your understanding:

1. ✅ Explain why passwords are hashed, not encrypted?
   - **Hashing is one-way** (can't reverse it)
   - **Even if database leaks**, passwords are safe

2. ✅ Describe what a JWT token contains?
   - **Header** (algorithm info)
   - **Payload** (user data: userId, email)
   - **Signature** (proof of authenticity)

3. ✅ Trace a request from client to database?
   - Client → tracker.ts → routes → middleware → controller → service → database

4. ✅ Understand when middleware runs?
   - **Before** route handlers
   - Can **block** requests or **augment** them (add userId)

5. ✅ Implement similar auth in a new project?
   - Install dependencies (bcryptjs, jsonwebtoken, zod)
   - Create same file structure
   - Follow same patterns

6. ✅ Debug authentication issues?
   - Check JWT_SECRET is set
   - Verify token format: "Bearer TOKEN"
   - Check token expiration
   - Trace through middleware → controller → service

### Next Phases

Now that you understand authentication (Phase 3), you're ready for:

- **Phase 4:** Backend API - Protected transaction routes
  - Use `isAuth` middleware to protect endpoints
  - Filter data by `req.userId` (set by middleware)
  - Build CRUD operations for transactions

- **Phase 6:** Frontend Authentication UI
  - Build login form
  - Store JWT in localStorage
  - Send tokens with requests
  - Handle token expiration

---

## 📚 Appendix: Quick Reference

### Useful Commands

```bash
# Install auth dependencies
npm install bcryptjs jsonwebtoken zod
npm install @types/bcryptjs @types/jsonwebtoken --save-dev

# Start backend development server
npm run dev

# Test signup endpoint
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"myPass123"}'

# Test login endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"myPass123"}'

# Test protected endpoint (replace TOKEN)
curl http://localhost:8000/feed/transactions \
  -H "Authorization: Bearer TOKEN"
```

### Package Versions Used

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10"
  }
}
```

### Helpful Resources

- [JWT.io](https://jwt.io/) - Decode and inspect JWT tokens
- [bcryptjs docs](https://www.npmjs.com/package/bcryptjs) - Password hashing library
- [Zod docs](https://zod.dev/) - TypeScript-first validation
- [Express middleware guide](https://expressjs.com/en/guide/using-middleware.html) - Official docs

---

**🎉 Congratulations!** You now have a deep understanding of how authentication works in this Money Tracking application. You're ready to move on to the next phases!
