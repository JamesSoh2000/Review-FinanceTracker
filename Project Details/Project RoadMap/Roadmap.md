# Learning Roadmap: Full-Stack Personal Finance Tracker

This roadmap is designed to guide you through the process of learning the necessary technologies to build the personal finance tracker project. It's structured to build upon your existing knowledge of Python and simple JavaScript.

## Foundational Skills (Start Here)

These are the absolute basics you'll need for web development.

1.  **HTML & CSS:**
    *   **What:** The structure (HTML) and styling (CSS) of web pages.
    *   **Why:** You need to understand how to create the basic layout and look of your application.
    *   **Topics:**
        *   HTML: Tags, attributes, forms, semantic HTML.
        *   CSS: Selectors, properties, Flexbox, Grid, responsive design.

2.  **JavaScript (ES6+):**
    *   **What:** The core programming language of the web.
    *   **Why:** You'll use this for both the frontend and backend.
    *   **Topics:**
        *   Variables, data types, operators.
        *   Functions, arrow functions.
        *   Arrays and objects (including methods like `map`, `filter`, `reduce`).
        *   Asynchronous JavaScript: Promises, `async/await`.
        *   DOM manipulation.
        *   Modules (import/export).

## Backend Development (Node.js & Express)

You'll build the "engine" of your application first.

1.  **Node.js & npm:**
    *   **What:** A JavaScript runtime (Node.js) and its package manager (npm).
    *   **Why:** To run your backend server and manage libraries.
    *   **Topics:**
        *   Setting up a Node.js project (`npm init`).
        *   Installing and using packages.
        *   Running Node.js scripts.

2.  **Express.js:**
    *   **What:** A popular web framework for Node.js.
    *   **Why:** To create your REST API.
    *   **Topics:**
        *   Setting up an Express server.
        *   Routing (GET, POST, PUT, DELETE).
        *   Middleware.
        *   Handling requests and responses.
        *   Serving static files.

3.  **TypeScript:**
    *   **What:** A superset of JavaScript that adds static typing.
    *   **Why:** The project uses it for both frontend and backend, making the code more robust.
    *   **Topics:**
        *   Basic types (string, number, boolean, etc.).
        *   Interfaces and types.
        *   Functions and their types.
        *   Generics.

4.  **REST API Design:**
    *   **What:** A set of rules for building web APIs.
    *   **Why:** To structure the communication between your frontend and backend.
    *   **Topics:**
        *   HTTP methods and status codes.
        *   JSON data format.
        *   Designing API endpoints.

5.  **Authentication with JWT:**
    *   **What:** JSON Web Tokens for secure authentication.
    *   **Why:** To protect user data and manage user sessions.
    *   **Topics:**
        *   How JWTs work (header, payload, signature).
        *   Creating and signing tokens.
        *   Verifying tokens in middleware.
        *   Password hashing (`bcryptjs`).

## Database (PostgreSQL)

You'll need a place to store your financial data.

1.  **SQL Fundamentals:**
    *   **What:** The language for interacting with relational databases.
    *   **Why:** To create tables, and to create, read, update, and delete data.
    *   **Topics:**
        *   `CREATE TABLE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE`.
        *   `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`.
        *   Primary and foreign keys.

2.  **PostgreSQL:**
    *   **What:** A powerful, open-source relational database.
    *   **Why:** It's the database used in the original project.
    *   **Topics:**
        *   Installing and setting up PostgreSQL.
        *   Using a GUI tool like pgAdmin or DBeaver.
        *   Connecting to PostgreSQL from Node.js (using the `pg` library).

3.  **Database Migrations:**
    *   **What:** A way to manage changes to your database schema over time.
    *   **Why:** To keep your database structure in sync with your application code.
    *   **Topics:**
        *   Understanding the concept of migrations.
        *   Writing migration files (like the `.sql` files in the project).

## Frontend Development (React)

Now you'll build the user interface.

1.  **React:**
    *   **What:** A JavaScript library for building user interfaces.
    *   **Why:** It's the foundation of the project's frontend.
    *   **Topics:**
        *   Components (functional components).
        *   JSX (writing HTML-like code in JavaScript).
        *   Props (passing data to components).
        *   State (`useState` hook).
        *   Lifecycle methods (`useEffect` hook).
        *   Handling events.

2.  **React Router:**
    *   **What:** A library for handling navigation in a React application.
    *   **Why:** To create different pages (e.g., dashboard, login).
    *   **Topics:**
        *   Setting up routes.
        *   Linking between pages.
        *   Dynamic routing.

3.  **Making API Calls:**
    *   **What:** How the frontend communicates with the backend.
    *   **Why:** To fetch and display data, and to send user input to the server.
    *   **Topics:**
        *   Using the `fetch` API or a library like `axios`.
        *   Making GET, POST, PUT, DELETE requests.
        *   Handling API responses and errors.

4.  **State Management (React Context):**
    *   **What:** A way to manage data that needs to be shared across many components.
    *   **Why:** For things like user authentication status.
    *   **Topics:**
        *   Creating a context.
        *   Using the `useContext` hook.

5.  **UI Components with Material-UI (MUI):**
    *   **What:** A popular library of pre-built React components.
    *   **Why:** To quickly build a professional-looking user interface.
    *   **Topics:**
        *   Installing and setting up MUI.
        *   Using common components (buttons, text fields, cards, etc.).
        *   Customizing the theme.

## DevOps (Docker)

You'll learn how to package and run your application.

1.  **Docker:**
    *   **What:** A platform for developing, shipping, and running applications in containers.
    *   **Why:** To ensure your application runs the same way in any environment.
    *   **Topics:**
        *   What containers are.
        *   Writing a `Dockerfile`.
        *   Building and running Docker images.
        *   `docker-compose` for managing multi-container applications.

Good luck with your learning journey!
