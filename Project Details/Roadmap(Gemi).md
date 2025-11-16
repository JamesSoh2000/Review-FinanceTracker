### Phase 1: Project Structure & Configuration
- **Goal**: Understand how the project is organized into separate frontend, backend, and database services and how they are configured to work together.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/docker-compose.yaml`
    2.  `/home/james/Personal/Money Tracking/Original Project/backend/package.json`
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/package.json`
    4.  `/home/james/Personal/Money Tracking/Original Project/README.md`
- **Concepts to Learn**:
    - Monorepo project structure (separate directories for each service).
    - Role of `package.json` (dependencies, scripts).
    - High-level service orchestration with Docker Compose.
- **Questions to Answer**:
    - What are the three main services defined in this application?
    - How are the port mappings configured for each service?
    - What scripts are available for running the backend and frontend?
- **Dependencies**: None

### Phase 2: Database Design & Migrations
- **Goal**: Understand the database schema, the relationships between tables, and how the database is versioned using migrations.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/database/migrations/20240305063418723_create-main-tables.sql`
    2.  `/home/james/Personal/Money Tracking/Original Project/database/migrations/20240305063429859_create-data-model.sql`
    3.  `/home/james/Personal/Money Tracking/Original Project/database/migrations/20240717120000_add-users-table.sql`
    4.  `/home/james/Personal/Money Tracking/Original Project/database/src/runMigrations.ts`
- **Concepts to Learn**:
    - Relational database schema design (tables, columns, data types).
    - Primary Keys, Foreign Keys, and table relationships.
    - Database migration principles for version control.
- **Questions to Answer**:
    - What are the main tables in the database and what is their purpose?
    - How is the `transactions` table related to the `users` table?
    - What is the purpose of the `runMigrations.ts` script?
- **Dependencies**: Phase 1

### Phase 3: Backend Architecture (Routing, Controllers, Services)
- **Goal**: Understand how the backend is structured to handle incoming API requests and separate concerns.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/backend/src/tracker.ts` (Entry Point)
    2.  `/home/james/Personal/Money Tracking/Original Project/backend/src/routes/feed.ts` (Routing)
    3.  `/home/james/Personal/Money Tracking/Original Project/backend/src/controllers/feed.ts` (Controller)
    4.  `/home/james/Personal/Money Tracking/Original Project/backend/src/services/feed.service.ts` (Service/Business Logic)
- **Concepts to Learn**:
    - Service-oriented architecture (Routes, Controllers, Services).
    - Dependency injection and separation of concerns.
    - Express.js middleware and routing.
- **Questions to Answer**:
    - What is the flow of a request from the router to the service layer?
    - What is the responsibility of a controller versus a service in this architecture?
    - How is the database connection made available to the services?
- **Dependencies**: Phase 2

### Phase 4: Authentication & Security (JWT, bcrypt, middleware)
- **Goal**: Understand how user authentication is implemented and how API routes are secured.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/backend/src/routes/auth.ts`
    2.  `/home/james/Personal/Money Tracking/Original Project/backend/src/controllers/auth.controller.ts`
    3.  `/home/james/Personal/Money Tracking/Original Project/backend/src/services/auth.service.ts`
    4.  `/home/james/Personal/Money Tracking/Original Project/backend/src/middleware/is-auth.ts`
- **Concepts to Learn**:
    - JSON Web Tokens (JWT) for stateless authentication.
    - Password hashing with `bcrypt`.
    - Middleware for protecting routes.
- **Questions to Answer**:
    - How is a JWT generated upon successful login?
    - How does the `is-auth.ts` middleware validate a token and protect a route?
    - Why is it important to hash passwords before storing them?
- **Dependencies**: Phase 3

### Phase 5: API Design & Data Flow
- **Goal**: Understand the principles of the REST API design used and the structure of data exchanged between the client and server.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/backend/src/routes/auth.ts`
    2.  `/home/james/Personal/Money Tracking/Original Project/backend/src/routes/feed.ts`
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/utils/apiFetch.ts`
- **Concepts to Learn**:
    - RESTful API conventions (HTTP verbs, status codes, URL structure).
    - API request/response structure (JSON payloads).
    - Centralized API fetching on the frontend.
- **Questions to Answer**:
    - What HTTP methods are used for login, signup, and fetching data?
    - What is the base URL for the API, and how is it configured on the frontend?
    - How are authorization headers added to requests in `apiFetch.ts`?
- **Dependencies**: Phase 4

### Phase 6: Frontend Architecture (React components, routing, state)
- **Goal**: Understand the structure of the React application, including how components are organized and how application state is managed.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/index.tsx` (Entry Point)
    2.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/App.tsx` (Main Router)
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/pages/cashflow/index.tsx` (Page Component)
    4.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/components/DashboardBox.tsx` (Reusable Component)
    5.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/context/AuthContext.tsx` (State Management)
- **Concepts to Learn**:
    - Component-based architecture.
    - Client-side routing.
    - React Context for global state management.
- **Questions to Answer**:
    - How is routing handled in the application?
    - What is the difference between a "page" and a "component"?
    - How does `AuthContext` provide authentication state to the rest of the app?
- **Dependencies**: Phase 1

### Phase 7: Authentication Flow (Frontend ↔ Backend)
- **Goal**: Understand the end-to-end process of a user logging in, from submitting the form to storing the token and accessing protected data.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/pages/login/index.tsx`
    2.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/context/AuthContext.tsx`
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/utils/apiFetch.ts`
    4.  `/home/james/Personal/Money Tracking/Original Project/backend/src/controllers/auth.controller.ts`
- **Concepts to Learn**:
    - Client-side token handling (storage and retrieval).
    - Guarding routes on the frontend based on authentication status.
    - Integrating frontend state with backend API calls.
- **Questions to Answer**:
    - What happens when the login form is submitted? Trace the flow.
    - Where is the JWT stored on the client side after login?
    - How does the frontend know whether to show the login page or the dashboard?
- **Dependencies**: Phase 4, Phase 6

### Phase 8: Data Visualization & Dashboard
- **Goal**: Understand how financial data is fetched and displayed in the dashboard components.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/pages/cashflow/index.tsx`
    2.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/pages/cashflow/Row1.tsx`
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/components/FinancialMetricsBox.tsx`
    4.  `/home/james/Personal/Money Tracking/Original Project/backend/src/services/feed.service.ts`
- **Concepts to Learn**:
    - Fetching data for visualization from the backend.
    - Structuring React components for a dashboard layout.
    - Passing data down through component props.
- **Questions to Answer**:
    - How does the main dashboard page fetch its data?
    - What is the purpose of the `Row1` and `Row2` components?
    - How does the backend service prepare the data for the financial overview?
- **Dependencies**: Phase 5, Phase 6

### Phase 9: Containerization & Deployment
- **Goal**: Understand how the entire application is containerized with Docker for consistent development and deployment.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/docker-compose.yaml`
    2.  `/home/james/Personal/Money Tracking/Original Project/backend/Dockerfile`
    3.  `/home/james/Personal/Money Tracking/Original Project/frontend/Dockerfile`
    4.  `/home/james/Personal/Money Tracking/Original Project/database/Dockerfile`
- **Concepts to Learn**:
    - Dockerfile basics (FROM, WORKDIR, COPY, RUN, CMD).
    - Multi-stage builds for optimization.
    - Inter-service communication within a Docker network.
- **Questions to Answer**:
    - How are the frontend and backend images built?
    - How does the backend container connect to the database container?
    - What is the purpose of using `volumes` in `docker-compose.yaml`?
- **Dependencies**: Phase 1

### Phase 10: Integration & Communication Between Layers
- **Goal**: Synthesize knowledge from all previous phases to see how the frontend, backend, and database work together as a cohesive system.
- **Key Files to Study**:
    1.  `/home/james/Personal/Money Tracking/Original Project/docker-compose.yaml`
    2.  `/home/james/Personal/Money Tracking/Original Project/frontend/src/utils/apiFetch.ts`
    3.  `/home/james/Personal/Money Tracking/Original Project/backend/src/db_conn/db.ts`
    4.  `/home/james/Personal/Money Tracking/Original Project/backend/src/tracker.ts`
- **Concepts to Learn**:
    - Full-stack application data flow.
    - Environment variables for configuration (ports, database credentials).
    - Network communication between containers.
- **Questions to Answer**:
    - Trace a request from a button click on the frontend to a database query and back.
    - How are environment variables used to configure the database connection?
    - How does Docker Compose facilitate communication between the services?
- **Dependencies**: All previous phases