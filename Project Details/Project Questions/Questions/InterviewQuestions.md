# In-Depth Interview Questions for the Personal Finance Tracker Project

This document contains a list of potential interview questions based on your resume bullet and the project's technical stack. The questions are designed to move from a high-level overview to specific technical details, which is a common interview pattern.

---

### Category 1: High-Level & Project Overview

*   "Walk me through the architecture of your Personal Finance Tracker. How do the frontend, backend, and database interact?"
*   "What was the primary motivation for building this project? Was it a personal need, a learning exercise, or something else?"
*   "You mentioned 'real-time visualizations.' Can you elaborate on that? Is it using WebSockets for true real-time data push, or is it frequent polling from the client?"
*   "What was the most challenging feature to implement and why?"
*   "If you had another month to work1 on this, what would you add or change?"

---

### Category 2: Backend & API Design (Node.js, Express, TypeScript)

*   "Let's talk about your REST API. Can you describe the authentication flow from the moment a user submits their login credentials?"
*   "I see you used JWTs. Why did you choose JWTs over another authentication mechanism like sessions? What are the pros and cons?"
*   "In your `is-auth.ts` middleware, how do you handle an expired or invalid token? What HTTP status code would you send back and why?"
*   "Your code is structured with `controllers` and `services`. What is the specific responsibility of a controller versus a service in your architecture? Why did you choose this pattern?"
*   "Looking at `feed.ts` and `auth.ts` in your routes, how do you handle request validation and error handling for incoming data?"
*   "How did you ensure the security of user passwords? You mentioned bcrypt; can you explain what "hashing" and "salting" are in this context?"
*   "What other security considerations did you take into account for your backend, aside from authentication (e.g., SQL injection, CORS, rate limiting)?"

---

### Category 3: Frontend Architecture (React, TypeScript)

*   "How do you manage state in your React application? I see an `AuthContext.tsx`—can you explain how it works and what data it holds?"
*   "When would you choose to use the Context API versus a more robust state management library like Redux or Zustand?"
*   "Tell me about your component structure. What is the purpose of `FlexBetween.tsx` and `DashboardBox.tsx`? How did you approach creating reusable components?"
*   "How does the frontend handle the JWT token once it receives it from the backend? Where is it stored, and what are the security implications of that choice (e.g., localStorage vs. cookies)?"
*   "In your `cashflow/index.tsx` page, how do you handle loading and error states when fetching data from the API?"
*   "The file `apiFetch.ts` suggests a centralized place for API calls. How did you design this utility to handle things like setting the `Authorization` header for protected requests?"
*   "What was the purpose of creating custom themes in `theme.ts` and `expanded.theme.ts`?"

---

### Category 4: Database (SQL & Migrations)

*   "I see you have a `migrations` folder with several SQL files. Why is a migration system important for database schema management, especially in a team environment?"
*   "Can you walk me through your database schema? What are the main tables and the relationships between them?"
*   "What would happen if one of your migrations failed halfway through? How would you handle that situation?"
*   "Looking at your seed files (`get_financial_overview.sql`), did you write any complex SQL queries for this project? Can you give an example of a query that joins multiple tables to produce a result for the dashboard?"
*   "Why did you choose a relational database (like PostgreSQL, which is common with Node.js) over a NoSQL database for this type of application?"

---

### Category 5: System Design & DevOps (Docker)

*   "You containerized the application using Docker Compose. Why was this beneficial? What problems does Docker solve here?"
*   "Can you explain the role of the `Dockerfile` in the `backend`, `database`, and `frontend` directories? How are they different?"
*   "How do the different containers (frontend, backend, database) communicate with each other in your `docker-compose.yaml` configuration?"
*   "How do you manage environment variables and secrets (like database passwords or JWT secrets) in your Docker setup? You should not hardcode them."
*   "If this project were to go into production, what would be the next steps in your deployment process? How would you automate building and deploying these containers (CI/CD)?"
*   "How would you scale this application to handle a large number of users? What would be the first bottleneck you'd expect to encounter?"
