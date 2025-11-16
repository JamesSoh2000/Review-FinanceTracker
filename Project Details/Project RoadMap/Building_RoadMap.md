# Building Your Personal Finance Tracker with Python and JavaScript

This document provides a detailed roadmap for rebuilding your personal finance tracker project from scratch. We will use Python with the Flask framework for the backend, plain JavaScript for the frontend, and PostgreSQL for the database. This approach will simplify the project while retaining all the core functionalities of the original application.

## Phase 1: Backend Development with Python and Flask

In this phase, we will build the core of our application: the backend API. This API will handle business logic, data storage, and authentication.

### Step 1: Setting up the Python Environment

First, we need to set up our Python development environment and install the necessary libraries.

1.  **Create a project directory:**
    ```bash
    mkdir money-tracker-python
    cd money-tracker-python
    ```

2.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Flask and other dependencies:**
    ```bash
    pip install Flask psycopg2-binary Flask-JWT-Extended python-dotenv
    ```
    *   **Flask:** A lightweight web framework for Python.
    *   **psycopg2-binary:** A PostgreSQL adapter for Python.
    *   **Flask-JWT-Extended:** A library to manage JWT authentication in Flask.
    *   **python-dotenv:** To manage environment variables.

4.  **Create the project structure:**
    ```
    money-tracker-python/
    ├── app/
    │   ├── __init__.py
    │   ├── routes.py
    │   ├── models.py
    │   └── auth.py
    ├── migrations/
    ├── .env
    └── run.py
    ```

### Step 2: Database Schema and Migrations

We will replicate the database schema from the original project.

1.  **Create the database tables:**
    Create SQL files in the `migrations` directory to define the table structure.

    `migrations/001_create_tables.sql`:
    ```sql
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
        id SERIAL PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expense_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type_id INT NOT NULL,
        category_id INT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (type_id) REFERENCES expense_types(id),
        FOREIGN KEY (category_id) REFERENCES expense_categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ```

2.  **Create a script to run migrations:**
    You can create a simple Python script to connect to your PostgreSQL database and execute the SQL files.

### Step 3: Implement API Endpoints

We will now create the Flask application and define the API endpoints.

1.  **Initialize the Flask app (`app/__init__.py`):**
    ```python
    from flask import Flask
    from .routes import main
    from .auth import auth_bp
    from flask_jwt_extended import JWTManager
    import os

    def create_app():
        app = Flask(__name__)
        app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET")
        jwt = JWTManager(app)

        app.register_blueprint(main)
        app.register_blueprint(auth_bp)

        return app
    ```

2.  **Create the main routes (`app/routes.py`):**
    This file will contain all the data-related endpoints.

    ```python
    from flask import Blueprint, jsonify
    from flask_jwt_extended import jwt_required

    main = Blueprint('main', __name__)

    @main.route('/feed/expense-categories', methods=['GET'])
    def get_expense_categories():
        # Add logic to fetch expense categories from the database
        return jsonify([])

    # Add other feed routes here...
    ```

3.  **Implement authentication (`app/auth.py`):**
    This file will handle user registration and login.

    ```python
    from flask import Blueprint, request, jsonify
    from flask_jwt_extended import create_access_token

    auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

    @auth_bp.route('/signup', methods=['POST'])
    def signup():
        # Add logic to create a new user
        return jsonify({"msg": "User created"}), 201

    @auth_bp.route('/login', methods=['POST'])
    def login():
        # Add logic to verify user credentials and create a JWT
        access_token = create_access_token(identity="example_user")
        return jsonify(access_token=access_token)
    ```

## Phase 2: Frontend Development with JavaScript

In this phase, we will build the user interface for our application using HTML, CSS, and plain JavaScript.

### Step 1: Basic HTML Structure

Create the main HTML files for your application.

1.  **`index.html` (Login Page):**
    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login</title>
    </head>
    <body>
        <h1>Login</h1>
        <form id="login-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <script src="js/auth.js"></script>
    </body>
    </html>
    ```

2.  **`dashboard.html`:**
    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard</title>
    </head>
    <body>
        <h1>Dashboard</h1>
        <div id="data-container"></div>
        <script src="js/dashboard.js"></script>
    </body>
    </html>
    ```

### Step 2: JavaScript for Authentication and API Calls

Create JavaScript files to handle user interactions and communication with the backend.

1.  **`js/auth.js`:**
    ```javascript
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/dashboard.html';
        } else {
            alert('Login failed');
        }
    });
    ```

2.  **`js/dashboard.js`:**
    ```javascript
    async function fetchData() {
        const token = localStorage.getItem('token');
        const response = await fetch('/feed/expense-categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            // Render the data in the data-container
        } else {
            window.location.href = '/index.html';
        }
    }

    fetchData();
    ```

## Phase 3: Deployment with Docker

Finally, we will containerize our application for easy deployment.

1.  **Create a `Dockerfile` for the backend:**
    ```dockerfile
    FROM python:3.9-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install -r requirements.txt
    COPY . .
    CMD ["flask", "run", "--host=0.0.0.0"]
    ```

2.  **Create a `Dockerfile` for the frontend:**
    ```dockerfile
    FROM nginx:alpine
    COPY . /usr/share/nginx/html
    ```

3.  **Create a `docker-compose.yaml`:**
    ```yaml
    version: '3.8'
    services:
      backend:
        build: ./money-tracker-python
        ports:
          - "5000:5000"
        environment:
          - JWT_SECRET=your-secret-key
          # Add other environment variables
      frontend:
        build: ./frontend # Assuming you have a frontend directory
        ports:
          - "8080:80"
      db:
        image: postgres:13
        environment:
          - POSTGRES_USER=user
          - POSTGRES_PASSWORD=password
          - POSTGRES_DB=tracker
        volumes:
          - postgres-data:/var/lib/postgresql/data
    volumes:
      postgres-data:
    ```

This roadmap provides a high-level overview of the steps involved in rebuilding your project. Each step will require more detailed implementation, which you can tackle one by one. Good luck!
