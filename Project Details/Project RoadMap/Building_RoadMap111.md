# Full-Stack Finance Tracker: A Rebuilding Roadmap

## Introduction

Welcome to your personalized roadmap for rebuilding the Full-Stack Finance Tracker! This guide is designed to take you from a blank folder to a fully functional web application, phase by phase. We will focus on understanding the "why" behind each decision, building a solid foundation of full-stack development skills.

**Our Technology Stack:**

*   **Backend:** Python with FastAPI (A modern, fast web framework for building APIs)
*   **Frontend:** React.js (The most popular JavaScript library for building user interfaces)
*   **Database:** PostgreSQL (A powerful, open-source relational database)
*   **Containerization:** Docker & Docker Compose (For a consistent and easy-to-manage development environment)

This stack was chosen to align with your Python skills while introducing you to the core concepts of modern web development used in the original project.

---

## Phase 0: The Foundation - Setup & Environment

**Phase Overview:**
Before writing any application code, we need to set up our project structure and development environment. This phase ensures we have all the tools we need and that our project is organized, scalable, and easy to manage.

**Files to Create:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/` (Create this new root folder for your project)
*   `/home/james/Personal/Money Tracking/Rebuilt Project/.gitignore`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/docker-compose.yaml`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/database/`

**File Purpose:**
*   **Root Folder:** A new, clean directory for our rebuilt application.
*   **.gitignore:** Specifies which files and folders Git should ignore (e.g., dependency folders, environment files).
*   **docker-compose.yaml:** A configuration file that tells Docker how to run our multi-container application (backend, frontend, database).
*   **backend/, frontend/, database/:** Directories to keep our code organized by concern.

**Content Guidelines:**
*   **.gitignore:** Add entries for `__pycache__/`, `*.pyc`, `node_modules/`, `.env`, etc.
*   **docker-compose.yaml:** Define three services: `database`, `backend`, and `frontend`.
    *   The `database` service should use the official `postgres:13` image and configure environment variables for the user, password, and database name. Use a volume to persist data.
    *   The `backend` and `frontend` services will be configured in later phases.

**Key Concepts:**
*   **Version Control (Git):** Tracking changes in your code.
*   **Containerization (Docker):** Packaging applications and their dependencies into isolated environments called containers. This ensures your application runs the same way everywhere.
*   **Project Scaffolding:** Creating a clean and logical directory structure.

**Dependencies:**
*   Install Docker Desktop on your machine.
*   Install Git on your machine.

**Success Criteria:**
*   You have a new project folder with the specified directory structure.
*   The `docker-compose.yaml` file is created, and when you run `docker-compose up`, the PostgreSQL container starts successfully. You can verify this by running `docker ps`.

---

## Phase 1: Backend - "Hello World" with FastAPI

**Phase Overview:**
We'll create the most basic version of our backend API. This involves setting up the FastAPI application, creating a single endpoint, and ensuring it can run inside a Docker container.

**Files to Create:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/main.py`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/requirements.txt`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/Dockerfile`

**File Purpose:**
*   **main.py:** The entry point for our FastAPI application.
*   **requirements.txt:** Lists the Python dependencies for our backend (e.g., `fastapi`, `uvicorn`).
*   **Dockerfile:** Instructions for Docker to build an image of our backend application.

**Content Guidelines:**
*   **requirements.txt:** Add `fastapi` and `uvicorn[standard]`.
*   **main.py:**
    *   Import `FastAPI`.
    *   Create an instance of the FastAPI app: `app = FastAPI()`.
    *   Create a single "GET" endpoint at the root path (`/`) that returns a simple JSON message like `{"message": "Hello, World"}`.
*   **Dockerfile:**
    *   Start from an official Python image (e.g., `python:3.9-slim`).
    *   Set a working directory.
    *   Copy `requirements.txt` and install the dependencies.
    *   Copy the rest of the backend code.
    *   Define the command to run the application using `uvicorn`.
*   **docker-compose.yaml:** Update the `backend` service definition.
    *   Use the `build` context to point to the `backend` directory.
    *   Map the container port (e.g., 8000) to a host port.
    *   Set it to `depend_on` the `database` service.

**Key Concepts:**
*   **Web Framework (FastAPI):** A tool that makes it easier to build web applications and APIs.
*   **API Endpoint:** A specific URL where our API can be accessed to perform an action.
*   **Uvicorn:** An ASGI server that runs our Python web application.

**Dependencies:**
*   `fastapi`: The web framework.
*   `uvicorn`: The server to run our app.

**Success Criteria:**
*   Run `docker-compose up --build`.
*   Open your web browser and navigate to `http://localhost:8000` (or the port you configured).
*   You should see the JSON message `{"message": "Hello, World"}`.

---

## Phase 2: Database - Schema & Migrations

**Phase Overview:**
With our database container running, it's time to define the structure of our data. We will create the tables for users, categories, and transactions, mirroring the original project's schema.

**Files to Create:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/database/migrations/`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/database/migrations/001_create_tables.sql`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/database/migrations/002_seed_categories.sql`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/db.py`

**File Purpose:**
*   **001_create_tables.sql:** An SQL script to create the `users`, `expense_categories`, `expense_types`, and `transactions` tables.
*   **002_seed_categories.sql:** An SQL script to insert the initial data for expense categories and types.
*   **db.py:** A Python module in our backend to handle the database connection.

**Content Guidelines:**
*   **001_create_tables.sql:**
    *   Define the `users` table with `id`, `email`, `password_hash`, and `created_at`.
    *   Define `expense_categories` with `id` and `category_name`.
    *   Define `expense_types` with `id`, `type_name`, and a foreign key to `expense_categories`.
    *   Define `transactions` with `id`, `date`, `amount`, and foreign keys to `users`, `expense_types`, and `expense_categories`.
*   **002_seed_categories.sql:** Use `INSERT INTO` statements to populate `expense_categories` and `expense_types` with the data from the original project.
*   **db.py:**
    *   Create a function to establish a connection to the PostgreSQL database using environment variables for the credentials.
    *   We will manually apply the migrations for now using a database tool like DBeaver or the `psql` command line.

**Key Concepts:**
*   **Database Schema:** The blueprint of our database, defining tables, columns, and relationships.
*   **SQL (Structured Query Language):** The language used to interact with relational databases.
*   **Foreign Keys:** A key used to link two tables together, enforcing data integrity.
*   **Data Seeding:** Populating a database with initial data.

**Dependencies:**
*   `psycopg2-binary`: A Python library to connect to PostgreSQL. Add this to `requirements.txt`.

**Success Criteria:**
*   Connect to your PostgreSQL database using a database client.
*   Run the SQL scripts from the migration files.
*   You should see the four new tables (`users`, `expense_categories`, etc.) with the correct columns and relationships. The category tables should be populated with data.

---

## Phase 3: Backend - User Authentication (JWT)

**Phase Overview:**
Now we'll secure our application. We will build the API endpoints for user registration and login. A successful login will return a JSON Web Token (JWT), which will be used to authenticate future requests.

**Files to Create:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/auth.py`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/models.py`

**File Purpose:**
*   **auth.py:** Will contain the FastAPI routes and logic for `/register` and `/login`.
*   **models.py:** Will contain Pydantic models to define the expected request and response data structures for our API (e.g., what a `UserRegistration` request should look like).

**Content Guidelines:**
*   **models.py:**
    *   Create Pydantic models for `UserCreate` (email, password) and `UserLogin` (email, password).
*   **auth.py:**
    *   Create a `/register` endpoint (POST):
        *   It should expect a `UserCreate` model.
        *   Hash the user's password using a library like `passlib`.
        *   Save the new user to the `users` table in the database.
    *   Create a `/login` endpoint (POST):
        *   It should expect a `UserLogin` model.
        *   Find the user in the database by email.
        *   Verify the provided password against the stored hash.
        *   If valid, generate a JWT containing the `user_id`.
        *   Return the JWT to the client.
*   **main.py:** Include the router from `auth.py` into the main FastAPI app.

**Key Concepts:**
*   **Authentication:** Verifying the identity of a user.
*   **Password Hashing:** A one-way process to securely store passwords. Never store passwords in plain text.
*   **JWT (JSON Web Token):** A compact, URL-safe means of representing claims to be transferred between two parties. It's the standard for stateless API authentication.
*   **Pydantic:** A library for data validation and settings management using Python type hints. FastAPI uses it extensively.

**Dependencies:**
*   `python-jose[cryptography]`: For creating and verifying JWTs.
*   `passlib[bcrypt]`: For hashing passwords.
*   Add these to `requirements.txt`.

**Success Criteria:**
*   Using a tool like `curl` or Postman, you can successfully send a request to the `/register` endpoint to create a new user.
*   You can then send a request to the `/login` endpoint with the correct credentials and receive a JWT in response.
*   Trying to log in with incorrect credentials results in an authentication error.

---

## Phase 4: Backend - Protected CRUD Endpoints

**Phase Overview:**
With authentication in place, we can now build the core functionality of our API: managing transactions. We will create CRUD (Create, Read, Update, Delete) endpoints that are protected, meaning they can only be accessed by a logged-in user.

**Files to Create:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/api.py`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/backend/security.py`

**File Purpose:**
*   **api.py:** Will contain the CRUD endpoints for transactions (e.g., `GET /transactions`, `POST /transactions`).
*   **security.py:** Will contain a reusable dependency function that verifies the JWT from the request header and extracts the user's ID.

**Content Guidelines:**
*   **security.py:**
    *   Create a FastAPI dependency function (e.g., `get_current_user`).
    *   This function will expect an `Authorization` header (e.g., `Bearer <token>`).
    *   It will decode the JWT, validate it, and extract the `user_id`.
    *   If the token is invalid or missing, it will raise an `HTTPException`.
*   **api.py:**
    *   Create a new FastAPI router.
    *   Define the endpoints for transactions:
        *   `POST /transactions`: Create a new transaction. This endpoint will depend on `get_current_user` and associate the new transaction with that user's ID.
        *   `GET /transactions`: Get all transactions for the logged-in user. This will also depend on `get_current_user` and use the user ID in the SQL query's `WHERE` clause.
*   **main.py:** Include the new router from `api.py`.

**Key Concepts:**
*   **Authorization:** Determining if a user has permission to access a resource.
*   **CRUD:** The four basic functions of persistent storage: Create, Read, Update, Delete.
*   **FastAPI Dependencies:** A powerful system for code reuse and sharing logic (like authentication) across multiple endpoints.
*   **Data Isolation:** Ensuring that users can only access their own data.

**Success Criteria:**
*   Requests to `/transactions` without a valid JWT fail with a 401 Unauthorized error.
*   When sending a valid JWT in the `Authorization` header, you can:
    *   Create a new transaction via `POST /transactions`.
    *   Retrieve all transactions for that user via `GET /transactions`.

---

## Phase 5: Frontend - React Setup & Static Layout

**Phase Overview:**
Time to switch to the frontend! We'll set up our React project and build the main static layout components, such as the navigation bar and sidebar. At this stage, there will be no dynamic data.

**Files to Create:**
*   (Use `npx create-react-app frontend` inside the `Rebuilt Project` directory)
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/components/Navbar.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/components/Sidebar.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/pages/Dashboard.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/pages/Login.js`

**File Purpose:**
*   **create-react-app:** A tool that generates a boilerplate React project with all the necessary configurations.
*   **Components & Pages:** We will organize our UI into reusable `components` and top-level `pages`.
*   **Navbar/Sidebar:** The main navigation elements of our app.
*   **Dashboard/Login:** The two main pages we'll need initially.

**Content Guidelines:**
*   Run `npx create-react-app frontend` in your project's root.
*   **Navbar.js / Sidebar.js:** Create simple React components that render some static HTML or Material-UI components to represent the layout.
*   **App.js:** Import `react-router-dom` to set up routes for `/login` and `/dashboard`. The main `/` route should lead to the dashboard.
*   **docker-compose.yaml:** Update the `frontend` service.
    *   Point the `build` context to the `frontend` directory.
    *   Map the container port (e.g., 3000) to a host port.
*   **frontend/Dockerfile:** Create a Dockerfile for the React app. A simple approach is to use a `node` image, copy the code, install dependencies, and run `npm start`.

**Key Concepts:**
*   **React:** A JavaScript library for building user interfaces with a component-based architecture.
*   **Component:** A self-contained, reusable piece of UI.
*   **JSX:** A syntax extension for JavaScript that looks like HTML and is used to define what the UI looks like in React.
*   **React Router:** A library for handling navigation and routing in a React application.

**Dependencies:**
*   `react`, `react-dom` (from create-react-app)
*   `react-router-dom`: For routing.
*   `@mui/material`, `@emotion/react`, `@emotion/styled`: For UI components.
*   Install these using `npm install` in the `frontend` directory.

**Success Criteria:**
*   Run `docker-compose up --build`.
*   Open your browser to `http://localhost:3000` (or your configured port).
*   You should see your static React application layout. You can navigate between the (empty) dashboard and login pages.

---

## Phase 6: Frontend - Authentication & API Connection

**Phase Overview:**
Let's bring the frontend and backend together. We will build the login form, connect it to our backend's `/login` endpoint, and manage the authentication state within our React app.

**Files to Create/Modify:**
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/utils/api.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/context/AuthContext.js`
*   Modify `Login.js` and `App.js`

**File Purpose:**
*   **api.js:** A utility file to centralize our API calls. It will contain a helper function for making `fetch` requests to our backend.
*   **AuthContext.js:** We will use React's Context API to manage and share the user's authentication state (like the JWT and whether they are logged in) across the entire application.
*   **Login.js:** Will now contain a real form that captures user input and calls the login API.
*   **App.js:** Will use the `AuthContext` to protect routes and redirect users to the login page if they are not authenticated.

**Content Guidelines:**
*   **api.js:** Create a function that takes an endpoint and options, and makes a `fetch` call to `http://localhost:8000/api/...` (or your backend URL).
*   **AuthContext.js:**
    *   Create a context that provides the `token`, `isLoggedIn` status, a `login` function, and a `logout` function.
    *   The `login` function will call the API, and on success, store the token in `localStorage` and update the context's state.
    *   The `logout` function will remove the token from `localStorage`.
*   **Login.js:**
    *   Use `useState` to manage the email and password form fields.
    *   On form submission, call the `login` function from your `AuthContext`.
*   **App.js:** Wrap your routes in the `AuthProvider`. Create a "protected route" component that checks `isLoggedIn` from the context. If not logged in, it redirects to `/login`.

**Key Concepts:**
*   **State Management (useState, useContext):** Tools in React for managing data that changes over time and sharing that data between components.
*   **localStorage:** A web storage object that allows you to save key/value pairs in the browser, persisting across sessions.
*   **Protected Routes:** A common pattern in web apps to restrict access to certain pages to authenticated users only.

**Dependencies:**
*   `axios` (optional, an alternative to `fetch` for making API calls).

**Success Criteria:**
*   You can now log in using the form on the `/login` page.
*   After a successful login, you are redirected to the dashboard.
*   The JWT is stored in `localStorage`.
*   If you are not logged in and try to access the dashboard directly, you are redirected back to the login page.
*   The "Logout" button clears the token and redirects to the login page.

---

## Phase 7: Frontend - Displaying Data

**Phase Overview:**
With authentication working, we can now fetch and display the user's financial data on the dashboard. This involves making authenticated API calls from the frontend to our protected backend endpoints.

**Files to Create/Modify:**
*   Modify `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/pages/Dashboard.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/components/TransactionsTable.js`
*   `/home/james/Personal/Money Tracking/Rebuilt Project/frontend/src/components/MetricsChart.js`

**File Purpose:**
*   **Dashboard.js:** This will now be a dynamic page that fetches data when it loads and passes it down to child components.
*   **TransactionsTable.js:** A component that takes a list of transactions and displays them in a table (using Material-UI's DataGrid).
*   **MetricsChart.js:** A component that takes data and renders a chart (using Recharts).

**Content Guidelines:**
*   **api.js:** Add a new helper function for making *authenticated* API calls. This function should get the token from `localStorage` and add the `Authorization: Bearer <token>` header to the request.
*   **Dashboard.js:**
    *   Use the `useEffect` hook to fetch data from the `/transactions` endpoint when the component mounts.
    *   Use the `useState` hook to store the fetched transactions in the component's state.
    *   Render the `TransactionsTable` and `MetricsChart` components, passing the data to them as props.
*   **TransactionsTable.js / MetricsChart.js:** These components will be "presentational," meaning they just receive data via props and render it.

**Key Concepts:**
*   **Data Fetching (useEffect):** The `useEffect` hook in React is used to perform side effects in function components, such as fetching data, setting up a subscription, or manually changing the DOM.
*   **Component Props:** How parent components pass data down to child components in React.
*   **Conditional Rendering:** Displaying a loading indicator while data is being fetched and showing the data or an error message once the request is complete.

**Dependencies:**
*   `recharts`: For creating charts.
*   `@mui/x-data-grid`: For a powerful data table component.

**Success Criteria:**
*   When you log in and land on the dashboard, a request is made to the backend to fetch your transactions.
*   The dashboard displays a table of your transactions.
*   The dashboard displays a chart visualizing your financial data.
*   If you have no transactions, the dashboard shows an empty state instead of crashing.

This roadmap provides a structured, educational path to rebuilding your application. You can now proceed phase by phase, asking for detailed code implementations or conceptual explanations whenever you need them. Good luck!
