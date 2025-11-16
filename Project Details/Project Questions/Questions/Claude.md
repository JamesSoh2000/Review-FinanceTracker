JamesSoh2000: You are an expert on interviews in computer science industry. I wrote the resume for the project 'Original Project' as following in the ResumeBullet.md. I am wondering what interviewers ask about my project in depth. Give me detailed questions that interviewers ask me about this project.

GitHub Copilot: Based on your resume bullets and project structure, here are detailed technical questions interviewers might ask:

## Architecture & Design Questions

- **Why did you choose a microservices architecture with separate frontend, backend, and database containers?** What trade-offs did you consider?
- **How does your React application communicate with the backend?** Walk me through the data flow from a user action to displaying updated data.
- **Why did you separate controllers and services in your backend?** What design pattern is this, and what benefits does it provide?
- **How do you handle environment-specific configurations** across development, staging, and production?

## Authentication & Security Questions

- **Explain your JWT authentication flow in detail.** Where are tokens stored on the client? How do you handle token refresh?
- **In your `is-auth.ts` middleware, how do you validate JWTs?** What claims do you check? How do you handle expired tokens?
- **Why did you choose bcrypt over other hashing algorithms?** What salt rounds did you use and why?
- **How do you prevent common vulnerabilities** like SQL injection, XSS, or CSRF in your application?
- **Where are sensitive credentials stored** (database passwords, JWT secrets)? How do you manage them in Docker?

## Database & Migrations Questions

- **Walk me through your database schema.** What tables exist and how are they related?
- **Why did you implement version-controlled migrations?** How does your migration system work?
- **Looking at your migration timestamps, how do you ensure migrations run in the correct order** in a team environment?
- **How do you handle rollbacks** if a migration fails in production?
- **What database are you using?** Why did you choose it over alternatives?

## Docker & DevOps Questions

- **Explain your `docker-compose.yaml` configuration.** What services does it define and how do they communicate?
- **How do you handle data persistence** for your database container?
- **What's your strategy for hot-reloading during development** with Docker?
- **How would you optimize your Docker images for production?** (Multi-stage builds, image size, etc.)
- **How do you handle database initialization** when spinning up containers for the first time?

## Frontend & Real-time Visualization Questions

- **How do you achieve "real-time" visualizations?** Are you using websockets, polling, or something else?
- **What charting library did you use** for your financial dashboard? Why?
- **How do you manage state in your React application?** (Context API, Redux, etc.)
- **Explain how your `AuthContext` works.** How does it integrate with protected routes?
- **How do you handle loading states and errors** when fetching financial data?

## API & Backend Questions

- **What endpoints does your REST API expose?** Describe the request/response format for a key endpoint.
- **How do you structure your API routes** (`auth.ts`, `feed.ts`)? What's the difference between these two route files?
- **How do you handle input validation** in your Express routes?
- **What HTTP status codes do you return** for different scenarios (success, validation errors, auth errors)?
- **How would you implement pagination** for expense lists?

## Testing & Code Quality Questions

- **What testing strategy did you implement?** (Unit tests, integration tests, E2E tests?)
- **How would you test your authentication middleware?**
- **What error handling strategy do you use** across frontend and backend?
- **How do you ensure type safety** between frontend and backend TypeScript code?

## Performance & Scalability Questions

- **How would you optimize the dashboard if a user had 10,000 transactions?**
- **What caching strategies could you implement** to reduce database queries?
- **How would you scale this application** to handle 10,000 concurrent users?
- **Are there any database indexes** you implemented for query performance?

## Behavioral/Situational Questions

- **What was the most challenging technical problem you faced** in this project? How did you solve it?
- **If you had more time, what would you improve** in this codebase?
- **How did you decide what features to prioritize** for the MVP?
- **Did you make any architectural decisions you later regretted?** What did you learn?

Prepare specific examples with actual code references and concrete metrics (response times, bundle sizes, etc.) to make your answers more compelling!