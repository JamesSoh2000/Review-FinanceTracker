# Rebuild Roadmap: Money Tracking App

This roadmap guides you through rebuilding the Money Tracking application from scratch. It is divided into logical phases to ensure a structured learning and development process.

## Phase 1: Project Setup & Infrastructure
*   **Goal:** Establish the project root, containerization, and database foundation.
*   **Files to Create:**
    *   `docker-compose.yaml`: Define services for `backend`, `frontend`, `warehouse` (PostgreSQL), and `db_migrations`.
    *   `database/Dockerfile`: Configuration for the migration runner container.
    *   `database/package.json`: Dependencies for migrations (`node-pg-migrate`, `pg`).
    *   `database/tsconfig.json`: TypeScript config for migration scripts.
    *   `database/src/runMigrations.ts`: Script to execute migrations programmatically.
*   **Key Concepts:** Docker Compose, PostgreSQL, Database Migrations (node-pg-migrate).
*   **Dependencies:** `pg`, `node-pg-migrate` (in `database`).

## Phase 2: Backend Core & Database Connection
*   **Goal:** Initialize the backend application and connect it to the database.
*   **Files to Create:**
    *   `backend/package.json`: Project metadata and dependencies.
    *   `backend/tsconfig.json`: TypeScript configuration.
    *   `backend/src/tracker.ts`: Application entry point (Express server setup).
    *   `backend/src/db_conn/db_conn.ts`: Database connection logic using `pg`.
*   **Key Concepts:** Express Server, TypeScript Setup, PostgreSQL Connection Pooling.
*   **Dependencies:** `express`, `pg`, `dotenv`, `cors`, `body-parser`.

## Phase 3: Backend Authentication & User Management
*   **Goal:** Implement user registration, login, and JWT authentication.
*   **Files to Create:**
    *   `database/migrations/[timestamp]_create_users_table.sql`: SQL migration for users table.
    *   `backend/src/controllers/auth.controller.ts`: Handle login/register requests.
    *   `backend/src/services/auth.service.ts`: Business logic for auth (hashing, tokens).
    *   `backend/src/routes/auth.routes.ts`: API routes for auth endpoints.
    *   `backend/src/middleware/auth.middleware.ts`: JWT verification middleware.
*   **Key Concepts:** JWT (JSON Web Tokens), Password Hashing (bcryptjs), Middleware, MVC Pattern.
*   **Dependencies:** `bcryptjs`, `jsonwebtoken`, `zod` (for validation).

## Phase 4: Backend Transaction Management
*   **Goal:** Implement CRUD operations for money transactions.
*   **Files to Create:**
    *   `database/migrations/[timestamp]_create_transactions_table.sql`: SQL migration for transactions table.
    *   `backend/src/controllers/transaction.controller.ts`: Handle transaction requests.
    *   `backend/src/services/transaction.service.ts`: Business logic for transactions.
    *   `backend/src/routes/transaction.routes.ts`: API routes for transactions.
*   **Key Concepts:** RESTful API Design, CRUD Operations, Database Relationships (User -> Transactions).

## Phase 5: Frontend Foundation & Routing
*   **Goal:** Set up the React application, styling engine, and routing.
*   **Files to Create:**
    *   `frontend/package.json`: Dependencies (React, MUI).
    *   `frontend/tsconfig.json`: TypeScript config.
    *   `frontend/src/index.tsx`: Entry point.
    *   `frontend/src/App.tsx`: Main component and Router setup.
    *   `frontend/src/theme.ts`: Material UI theme configuration.
    *   `frontend/src/context/AuthContext.tsx`: Context for managing user session state.
*   **Key Concepts:** React Router, Material UI Theming, React Context API.
*   **Dependencies:** `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`.

## Phase 6: Frontend Authentication UI
*   **Goal:** Create Login and Registration screens.
*   **Files to Create:**
    *   `frontend/src/pages/Login.tsx`: Login form page.
    *   `frontend/src/pages/Register.tsx`: Registration form page.
    *   `frontend/src/utils/api.ts`: Axios or fetch wrapper for API calls.
*   **Key Concepts:** Form Handling, API Integration, Protected Routes.

## Phase 7: Frontend Dashboard & Transactions
*   **Goal:** Build the main dashboard and transaction management UI.
*   **Files to Create:**
    *   `frontend/src/pages/Dashboard.tsx`: Main view showing transaction summary/charts.
    *   `frontend/src/components/TransactionTable.tsx`: Data grid for transactions.
    *   `frontend/src/components/AddTransactionModal.tsx`: Form to add new transactions.
*   **Key Concepts:** Data Visualization (Recharts), Data Grids (@mui/x-data-grid), Modals.
*   **Dependencies:** `recharts`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `date-fns`.
