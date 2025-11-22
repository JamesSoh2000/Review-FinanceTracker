# Comprehensive Prompt for Phase 3: Authentication System Explanation

Use this prompt to generate a detailed explanation of the authentication system implementation:

---

## Context

You are an expert backend developer and technical educator who specializes in teaching authentication concepts to developers who understand basic TypeScript but are new to backend security concepts.

## Target Audience

The reader:
- Understands basic TypeScript syntax (variables, functions, async/await, imports)
- Has never implemented JWT authentication before
- Has never used password hashing libraries
- Doesn't understand the concept of middleware in Express
- Needs to understand both **WHY** and **HOW** for each component

## Project Information

**Tech Stack:**
- Node.js + Express (TypeScript)
- PostgreSQL database
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing
- Zod for validation

**File Structure:**
```
backend/src/
├── routes/auth.ts              # Defines /auth/signup and /auth/login endpoints
├── controllers/auth.controller.ts  # Handles signup and login logic
├── services/auth.service.ts     # Database operations for users
├── middleware/is-auth.ts        # JWT verification middleware
└── tracker.ts                   # Main Express app that registers routes
```

## Explanation Requirements

Create a comprehensive, beginner-friendly explanation document that covers:

### Part 1: The Big Picture (Why Authentication?)
- **Why do we need authentication?** (Use real-world analogies)
- **What problems does authentication solve?**
- **What are the security threats** that Phase 3 protects against?

### Part 2: Core Concepts (Building Blocks)
For each concept, explain:
1. **What it is** (definition)
2. **Why we need it** (purpose)
3. **How it works** (simplified mechanism)
4. **Security implications** (what could go wrong)

Cover these concepts:
- **Password Hashing**
  - Why we never store plain text passwords
  - What bcryptjs does
  - What "salt" and "rounds" mean
  
- **JWT (JSON Web Tokens)**
  - What a token is (analogy: movie ticket, ID card)
  - Structure of JWT (header.payload.signature)
  - How tokens are created and verified
  - Why tokens expire
  - Where tokens are stored (backend vs frontend)
  
- **Express Middleware**
  - What middleware is (analogy: security checkpoint)
  - How middleware chains work in Express
  - The role of `next()`

### Part 3: The Authentication Flow (End-to-End)
Use **sequence diagrams** and step-by-step walkthroughs for:

1. **User Signup Flow**
   - Client sends email + password
   - Validation happens
   - Password gets hashed
   - User stored in database
   - Response sent back

2. **User Login Flow**
   - Client sends credentials
   - User lookup in database
   - Password verification
   - JWT creation
   - Token sent to client

3. **Protected Route Access Flow**
   - Client sends request with JWT
   - Middleware intercepts request
   - Token verification
   - userId extracted and attached to request
   - Request proceeds to route handler

### Part 4: File-by-File Deep Dive
For each file, explain:
1. **Purpose** - What is this file's job?
2. **Dependencies** - What does it import and why?
3. **Code Walkthrough** - Line-by-line explanation with actual code
4. **Key Patterns** - What TypeScript/Express patterns are used?
5. **Error Handling** - How does it handle failures?

Cover these files in order:
1. `auth.service.ts` - Database layer (foundational)
2. `auth.controller.ts` - Business logic layer
3. `auth.ts` (routes) - Route definitions
4. `is-auth.ts` - Middleware
5. `tracker.ts` - Integration point

### Part 5: How Everything Works Together
- **Architecture Diagram** showing the layered structure (Routes → Controllers → Services)
- **Request/Response Flow** diagrams
- **Dependency Graph** - which files depend on which
- **Error Propagation** - how errors flow through the system

### Part 6: Security Best Practices Explained
Explain each best practice found in the code:
- Using environment variables for JWT_SECRET
- Setting token expiration (1 hour)
- Using bcrypt with 12 rounds
- Not revealing user existence in error messages
- HTTP status codes (401 vs 409 vs 422)
- CORS configuration impact on authentication

### Part 7: Common Pitfalls & FAQs
Address questions like:
- What happens if JWT_SECRET is missing?
- Why do we use `401` for both "user not found" and "wrong password"?
- Can tokens be refreshed?
- Where should tokens be stored on the frontend?
- What happens when a token expires?

## Output Format

Structure the explanation as a **Markdown document** with:
- Clear section headers
- Mermaid diagrams for flows and architecture
- Code blocks with line-by-line comments
- Callout boxes for important concepts (use markdown blockquotes with emojis)
- Real code examples from the actual project files
- Visual separators between major sections
- A table of contents at the beginning

## Success Criteria

After reading this explanation, the reader should be able to:
1. ✅ Explain why passwords are hashed, not encrypted
2. ✅ Describe what a JWT token contains
3. ✅ Trace a request from client to database and back
4. ✅ Understand when and why middleware runs
5. ✅ Implement similar authentication in a new project
6. ✅ Debug authentication issues in the existing code

---

**Generate this comprehensive explanation now, using actual code from the project files provided.**
