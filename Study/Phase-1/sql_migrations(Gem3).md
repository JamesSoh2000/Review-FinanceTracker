# SQL Architecture Deep Dive: Money Tracking Project

> [!NOTE]
> **Purpose**: This guide provides a comprehensive, line-by-line explanation of the database layer in your Money Tracking application. It is designed for developers with basic SQL knowledge to master the concepts of migrations, schema design, and stored procedures.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: The Foundation (Schema)](#phase-1-the-foundation-schema)
3. [Phase 2: The Data (Seeding)](#phase-2-the-data-seeding)
4. [Phase 3: The Evolution (Users)](#phase-3-the-evolution-users)
5. [Phase 4: The Logic (Stored Functions)](#phase-4-the-logic-stored-functions)
6. [How It All Connects](#how-it-all-connects)

---

## Architecture Overview

Your database is built in layers, like a cake. You cannot put the frosting (data) on before baking the cake (tables).

| Layer | File Type | Purpose |
|-------|-----------|---------|
| **1. Schema** | Migration (`.sql`) | Defines the structure (Tables, Columns, Types) |
| **2. Data** | Migration (`.sql`) | Populates initial data (Categories, Types) |
| **3. Logic** | Seed (`.sql`) | Adds "programs" to the database (Functions) |

### 🔄 The Migration Lifecycle
Migrations are **version control for your database**.
- **Up Migration**: Applies changes (e.g., `CREATE TABLE`).
- **Down Migration**: Reverts changes (e.g., `DROP TABLE`).
- **Timestamped**: Files like `20240305...` run in chronological order.

---

## Phase 1: The Foundation (Schema)

**File**: `database/migrations/20240305063418723_create-main-tables.sql`

This file creates the skeleton of your application. It defines *what* data we can store.

### 1. Expense Categories Table
```sql
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);
```
- **`SERIAL`**: A special PostgreSQL type that creates an auto-incrementing integer (1, 2, 3...). You never have to manually assign an ID.
- **`PRIMARY KEY`**: The unique identifier. No two categories can have the same ID.
- **`VARCHAR(255)`**: Variable-length text, up to 255 characters.
- **`NOT NULL`**: Enforces that every category *must* have a name.

### 2. Expense Types Table
```sql
CREATE TABLE IF NOT EXISTS expense_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);
```
- **The Relationship**: This table is a "child" of `expense_categories`.
- **`FOREIGN KEY`**: This is the glue. It says "The value in `category_id` MUST exist in the `expense_categories` table."
    - *Benefit*: You cannot accidentally create an expense type for a non-existent category. This guarantees **Referential Integrity**.

### 3. Transactions Table
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (type_id) REFERENCES expense_types(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);
```
- **`DECIMAL(10, 2)`**: The perfect type for money.
    - `10`: Total number of digits.
    - `2`: Number of digits after the decimal point.
    - *Example*: `12345678.99` fits. `123.456` would be rounded or rejected.
- **Double Reference**: Notice it links to *both* `type_id` and `category_id`.
    - *Why?* Optimization. While we *could* find the category by looking up the type first (`transaction -> type -> category`), storing `category_id` directly allows for faster queries when you just want "Total spent on Food" without caring about the specific types (Groceries vs. Restaurants).

---

## Phase 2: The Data (Seeding)

**File**: `database/migrations/20240305063429859_create-data-model.sql`

Now that we have tables, we need to fill them. A blank finance app is useless.

### 1. Inserting Categories
```sql
INSERT INTO expense_categories (category_name) VALUES 
('Income'),
('Personal Fixed Costs'),
...
```
- This sets the "Standard" categories every user starts with.
- Because `id` is `SERIAL`, 'Income' automatically gets `id=1`, 'Personal Fixed Costs' gets `id=2`, etc.

### 2. Inserting Types (Linking to Categories)
```sql
INSERT INTO expense_types (type_name, category_id) VALUES 
('Salary', 1),      -- Links 'Salary' to 'Income' (id 1)
('Groceries', 2),   -- Links 'Groceries' to 'Personal Fixed Costs' (id 2)
...
```
- **Hardcoded IDs**: Here, we manually specify `1`, `2`, etc., because we know the order from the previous step. In a production app, you might look these up dynamically, but for a seed file, hardcoding is common and simple.

### 3. Dummy Transactions
```sql
INSERT INTO transactions (id, date, amount, type_id, category_id) VALUES ...
```
- **Purpose**: Immediate gratification. When you run the app for the first time, you see charts and graphs instead of a blank screen. This helps with development and testing.

---

## Phase 3: The Evolution (Users)

**File**: `database/migrations/20240717120000_add-users-table.sql`

This file represents a **Requirement Change**. The app started as single-user, but now needs to support multiple users.

### 1. Creating the Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
- **`UNIQUE`**: Ensures no two users can sign up with the same email.
- **`password_hash`**: **Security Critical**. We never store passwords (like "secret123"). We store a cryptographic hash (like `$2b$10$X7...`).
- **`DEFAULT CURRENT_TIMESTAMP`**: Automatically records *when* the user signed up without us needing to send that data.

### 2. Modifying Transactions (The "Alter")
```sql
ALTER TABLE transactions
ADD COLUMN user_id INTEGER,
ADD CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE;
```
- **`ALTER TABLE`**: Modifies an existing structure.
- **`ON DELETE CASCADE`**: A powerful cleanup rule.
    - *Scenario*: User "John" deletes his account.
    - *Result*: The database *automatically* deletes all 1,000 of John's transactions.
    - *Without this*: You'd have "orphan" transactions taking up space with no owner.

---

## Phase 4: The Logic (Stored Functions)

**Files**: `get_financial_overview.sql` & `get_income_expense.sql`

These are **Stored Procedures**. Instead of fetching 10,000 rows to your Node.js server and looping through them (slow), we send the logic *to* the data (fast).

### Deep Dive: `get_financial_metrics`

This function calculates your entire financial dashboard in one go.

#### The Power of CTEs (Common Table Expressions)
The function uses `WITH ...` clauses. Think of these as temporary variables holding tables.

1.  **`category_totals`**:
    - Groups transactions by `category` and `year`.
    - Labels them as 'Income' or 'Expense'.
    
2.  **`income_total` & `expense_total`**:
    - Splits the previous result into two separate lists.
    
3.  **`net_income`**:
    - Calculates `Income - Expense` for each year.
    - Uses `COALESCE(..., 0)` to handle cases where expenses might be null (zero).

4.  **`cumulative_net_income`**:
    ```sql
    SUM(total_net_income) OVER (ORDER BY year)
    ```
    - **Window Function**: This is magic. It calculates a running total.
    - *Year 1*: $10k
    - *Year 2*: $10k (current) + $10k (previous) = $20k.

#### The Final Calculation
```sql
SELECT 
    ...,
    (n.total_net_income / NULLIF(i.total_income, 0)) * 100 AS savings_rate_value
```
- **`NULLIF(..., 0)`**: Prevents "Division by Zero" errors. If income is 0, it returns NULL instead of crashing the query.

---

## How It All Connects

### The Data Flow
1.  **User Action**: User logs in and opens the dashboard.
2.  **API Call**: Frontend requests `GET /api/financial-overview`.
3.  **Backend**: Node.js calls the database: `SELECT * FROM get_financial_metrics(user_id)`.
4.  **Database**:
    - Looks at `transactions` table.
    - Filters by `user_id` (Security).
    - Joins with `expense_categories` to get names.
    - Runs the math defined in the function.
    - Returns a tiny, aggregated result set (e.g., 12 rows).
5.  **Frontend**: Receives the data and draws the charts.

### Why This Architecture?
- **Performance**: Math happens where the data lives.
- **Integrity**: Foreign keys prevent bad data.
- **Scalability**: Migrations allow the app to grow without breaking existing data.
- **Security**: Data is isolated by `user_id` at the database level.
