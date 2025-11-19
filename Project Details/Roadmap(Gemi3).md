JamesSoh2000: You are an expert full-stack architect specializing in React, Node.js, TypeScript, and PostgreSQL applications.

Analyze the Personal Finance Tracker project at /home/james/Personal/Money Tracking/Original Project and create a phased rebuild roadmap that guides me through reconstructing the project from scratch.

Project Context
Tech Stack: React (TypeScript), Node.js/Express (TypeScript), PostgreSQL, Docker
Architecture: Containerized 3-tier application (frontend, backend, database)
Key Features: JWT authentication, transaction management, financial analytics dashboard
Roadmap Requirements
Create a roadmap divided into logical phases where each phase represents a functional milestone. For each phase, provide:

Phase Structure:
## Phase N: [Phase Name]

**Goal**: [One sentence describing what this phase achieves]

**Files to Create**:
- `path/to/file1.ext` - [One line purpose]
- `path/to/file2.ext` - [One line purpose]
- `path/to/folder/` - [One line purpose]

**Implementation Overview**:
- [High-level bullet point 1 about what to implement]
- [High-level bullet point 2 about what to implement]
- [Configuration/setup needed]

**Dependencies**: [List any external packages/tools to install]

**Success Criteria**: [How to verify this phase works]

**Next Phase**: [What this phase enables for the next step]
Required Phases (Suggested Order):
Project Initialization & Docker Setup

Directory structure, gitignore, docker-compose.yaml
Database Layer

Migration system, schema creation, seed data
Backend Foundation

Express server, TypeScript config, database connection
Authentication System

User registration/login, JWT implementation, auth middleware
Backend API Routes

Protected endpoints for transactions, categories, financial data
Frontend Foundation

React app setup, routing, theming, context providers
Authentication UI

Login page, auth context, protected routes
Dashboard Layout

Navbar, sidebar, page structure
Data Visualization

Charts, tables, financial metrics display
Transaction Management

Create/edit/delete transactions, forms, modals
Constraints:
DO NOT include actual code implementations
DO specify exact file paths matching the original project structure
DO explain the purpose of each file in one sentence
DO indicate which files depend on others
DO list external packages that need to be installed (e.g., npm install express)
DO provide clear success criteria for each phase
KEEP descriptions high-level and conceptual
Output Format:
Save the roadmap as a markdown file structured so I can:

Work through phases sequentially
Ask follow-up questions like: "Explain Phase 3 files in detail" or "Show me how to implement Phase 5"
Understand dependencies between phases
Know when each phase is complete
Example Follow-up Prompts I'll Use:
After receiving this roadmap, I'll dive deeper with prompts like:

"Explain all files in Phase 2: Database Layer - what goes in each file?"
"Show me the implementation for backend/src/tracker.ts from Phase 3"
"Why do we need runner.ts? Walk me through its logic"
"What's the relationship between frontend/src/context/AuthContext.tsx and backend/src/middleware/is-auth.ts?"
Generate this roadmap now, organizing phases logically so each builds upon the previous one.

Workspace: Collecting workspace information# Personal Finance Tracker: Phased Rebuild Roadmap

This roadmap guides you through rebuilding the Personal Finance Tracker from scratch. Each phase represents a functional milestone that builds upon the previous one.

GitHub Copilot: # Personal Finance Tracker: Phased Rebuild Roadmap

This roadmap guides you through rebuilding the Personal Finance Tracker from scratch. Each phase represents a functional milestone that builds upon the previous one.

## Phase 1: Project Initialization & Docker Setup

**Goal**: Establish the containerized environment and project root structure to orchestrate services.

**Files to Create**:
- `docker-compose.yaml` - Defines the services (backend, frontend, database) and their networks.
- `.gitignore` - Specifies files to exclude from version control (node_modules, env files).
- `README.md` - Documentation for project setup and usage.

**Implementation Overview**:
- Define the PostgreSQL service with environment variables for credentials.
- Define the Backend and Frontend services (pointing to their respective Dockerfiles).
- Configure volume mapping for data persistence.

**Dependencies**: Docker, Docker Compose.

**Success Criteria**: Running `docker-compose up` spins up the containers (even if they fail immediately due to missing Dockerfiles in subfolders, the orchestration logic is valid).

**Next Phase**: Creating the database schema and migration logic so the backend has a target to connect to.

---

## Phase 2: Database Layer

**Goal**: Create a custom migration runner and define the SQL schema for users and financial data.

**Files to Create**:
- `database/Dockerfile` - Instructions to build the migration runner image.
- `database/package.json` - Dependencies for the migration scripts.
- `database/tsconfig.json` - TypeScript configuration for the runner.
- `database/src/runner.ts` - The entry point script that executes migrations against the DB.
- `database/src/runMigrations.ts` - Logic to read SQL files and apply them transactionally.
- `database/migrations/20240305063418723_create-main-tables.sql` - SQL to create transactions and KPI tables.
- `database/migrations/20240717120000_add-users-table.sql` - SQL to create the users table.

**Implementation Overview**:
- Implement a Node.js script to connect to Postgres using `pg`.
- Write logic to track which migrations have already run.
- Define the SQL schema for `users`, `transactions`, and `kpis`.

**Dependencies**: `pg` (node-postgres), `typescript`, `ts-node`.

**Success Criteria**: The database container starts, and the migration runner successfully creates the tables in the PostgreSQL instance.

**Next Phase**: Building the backend server to interact with this database.

---

## Phase 3: Backend Foundation

**Goal**: Initialize the Express server, configure TypeScript, and establish a database connection.

**Files to Create**:
- `backend/Dockerfile` - Instructions to build the Node.js backend image.
- `backend/package.json` - Backend dependencies and scripts.
- `backend/tsconfig.json` - TypeScript configuration for the backend.
- `backend/src/tracker.ts` - The main entry point for the Express application.
- `backend/src/db_conn/db.ts` - Singleton database connection pool configuration.

**Implementation Overview**:
- Set up a basic Express app with CORS and JSON parsing.
- Configure the Postgres connection pool using environment variables.
- Create a health check endpoint.

**Dependencies**: `express`, `cors`, `dotenv`, `pg`, `helmet`, `morgan`.

**Success Criteria**: The backend container runs without errors, and you can hit a test endpoint (e.g., `localhost:1337/health`) via Postman or curl.

**Next Phase**: Implementing security and user management.

---

## Phase 4: Authentication System

**Goal**: Implement secure user registration and login using JWTs.

**Files to Create**:
- `backend/src/controllers/auth.controller.ts` - Logic for handling login and signup requests.
- `backend/src/routes/auth.ts` - Route definitions mapping URLs to controller functions.
- `backend/src/services/auth.service.ts` - Business logic for password hashing and token generation.
- `backend/src/middleware/is-auth.ts` - Middleware to verify JWTs on protected routes.

**Implementation Overview**:
- Create logic to hash passwords using bcrypt.
- Implement JWT generation upon successful login.
- Create middleware to extract and verify the Bearer token from headers.

**Dependencies**: `jsonwebtoken`, `bcryptjs`.

**Success Criteria**: You can register a user via API and receive a JWT, and accessing a protected route without a token returns a 401 error.

**Next Phase**: Building the core financial API endpoints.

---

## Phase 5: Backend API Routes

**Goal**: Create protected endpoints for fetching financial data and managing transactions.

**Files to Create**:
- `backend/src/controllers/feed.ts` - Logic for fetching KPIs, transactions, and products.
- `backend/src/routes/feed.ts` - Route definitions for financial data endpoints.
- `backend/src/services/feed.service.ts` - Database queries to retrieve and aggregate financial data.

**Implementation Overview**:
- Implement endpoints to get "Kpis", "Products", and "Transactions".
- Ensure all these routes use the `is-auth` middleware.
- Write SQL queries to join or format data for the frontend.

**Dependencies**: None new (uses existing `pg` connection).

**Success Criteria**: Authenticated requests to `/kpis` or `/transactions` return JSON data retrieved from the database.

**Next Phase**: Setting up the React frontend to consume these APIs.

---

## Phase 6: Frontend Foundation

**Goal**: Initialize the React application, configure routing, and set up the design system.

**Files to Create**:
- `frontend/Dockerfile` - Instructions to build the React app.
- `frontend/package.json` - Frontend dependencies.
- `frontend/src/App.tsx` - Main component and routing setup.
- `frontend/src/index.tsx` - Entry point rendering the App.
- `frontend/src/theme.ts` - Material UI theme configuration (colors, typography).
- `frontend/src/expanded.theme.ts` - TypeScript module augmentation for custom theme properties.
- `frontend/src/utils/apiFetch.ts` - Wrapper around `fetch` to handle headers and base URLs.

**Implementation Overview**:
- Set up React Router.
- Configure Material UI `ThemeProvider` and `CssBaseline`.
- Create a reusable fetch utility that automatically attaches the JWT.

**Dependencies**: `react`, `react-dom`, `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`.

**Success Criteria**: The frontend container runs, and you can see a styled "Hello World" page in the browser at `localhost:3000`.

**Next Phase**: Building the UI for logging in.

---

## Phase 7: Authentication UI

**Goal**: Create the login interface and manage user session state.

**Files to Create**:
- `frontend/src/context/AuthContext.tsx` - React Context to store user state and login/logout functions.
- `frontend/src/pages/login/index.tsx` - The login page component.
- `frontend/src/App.tsx` (Update) - Add protected route logic.

**Implementation Overview**:
- Implement the AuthProvider to persist tokens in localStorage.
- Create a login form that calls the backend auth API.
- Redirect users to the dashboard upon success.

**Dependencies**: `formik` (optional, or standard state), `yup` (optional validation).

**Success Criteria**: You can log in via the UI, and the browser stores the token. Refreshing the page maintains the logged-in state.

**Next Phase**: Creating the structural layout for the application.

---

## Phase 8: Dashboard Layout

**Goal**: Build the navigation bar, sidebar, and responsive grid structure.

**Files to Create**:
- `frontend/src/pages/navbar/index.tsx` - Top navigation bar.
- `frontend/src/pages/sidebar/index.tsx` - Side navigation menu (if applicable).
- `frontend/src/components/FlexBetween.tsx` - Utility component for CSS flexbox layout.
- `frontend/src/components/BoxHeader.tsx` - Reusable header for dashboard widgets.

**Implementation Overview**:
- Create the main layout shell.
- Implement navigation links between pages.
- Style components using the defined theme.

**Dependencies**: `@mui/icons-material`.

**Success Criteria**: The application has a persistent top bar and a content area that changes based on the route.

---

## Phase 9: Data Visualization

**Goal**: Implement the main dashboard showing charts and financial metrics.

**Files to Create**:
- `frontend/src/pages/cashflow/index.tsx` - Main dashboard container.
- `frontend/src/pages/cashflow/Row1.tsx` - Top row of charts (e.g., Revenue vs Expenses).
- `frontend/src/pages/cashflow/Row2.tsx` - Middle row of charts (e.g., Operational vs Non-Operational).
- `frontend/src/components/DashboardBox.tsx` - Styled wrapper for charts.
- `frontend/src/components/FinancialMetricsBox.tsx` - Component to display key numbers.

**Implementation Overview**:
- Fetch data from the backend `feed` endpoints on mount.
- Render Line, Area, and Bar charts using Recharts.
- Map data to the grid layout.

**Dependencies**: `recharts`.

**Success Criteria**: The dashboard displays real data from the database in graphical format.

---

## Phase 10: Transaction Management

**Goal**: Allow users to add and manage specific transaction records.

**Files to Create**:
- `frontend/src/components/ExpenseFormModal.tsx` - Modal for adding new transactions.
- `frontend/src/components/DateRange.tsx` - Component for filtering data by date.
- `frontend/src/pages/cashflow/index.tsx` (Update) - Integrate the modal and refresh logic.

**Implementation Overview**:
- Create a form with fields for amount, category, and description.
- Implement the POST request to the backend.
- Trigger a data re-fetch upon successful submission.

**Dependencies**: `@mui/x-date-pickers` (optional).

**Success Criteria**: You can click "Add Transaction," fill out the form, save it, and see the dashboard charts update immediately.

**Next Phase**: Project Complete / Optimization.