JamesSoh2000: The markdown file 'Blog: Database Setup.md' explains how the project is made. I am trying to learn the concepts used in this project. Give me detailed explanation of what the migrations are with examples in the project. Be specific as possible to fully understand.

Workspace: Collecting workspace information# Understanding Database Migrations in Your Project

Migrations are **versioned scripts that manage changes to your database schema over time**. Think of them as a "version control system for your database structure" - similar to how Git tracks code changes, migrations track database structure changes.

## Core Concepts

### What Problem Do Migrations Solve?

Without migrations, you'd need to:
1. Manually run SQL commands on every database
2. Remember what changes you made and when
3. Risk inconsistencies between development, staging, and production databases

With migrations, you have:
- **Reproducible** database changes
- **Reversible** operations (rollback capability)
- **Tracked history** of all schema changes
- **Team coordination** - everyone applies the same changes in the same order

## Your Project's Migration System

Your project uses [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate), which provides a TypeScript/Node.js interface for managing PostgreSQL migrations.

### Migration Files Structure

Each migration file has **two sections**:

````sql
-- Up Migration (creates/modifies)
BEGIN;
-- SQL commands to apply changes
COMMIT;

-- Down Migration (reverts changes)
BEGIN;
-- SQL commands to undo the changes
COMMIT;
````

### Example 1: Creating Main Tables

Looking at `20240305063418723_create-main-tables.sql`:

````sql
-- Up Migration
BEGIN;

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
    FOREIGN KEY (type_id) REFERENCES expense_types(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);

COMMIT;

-- Down Migration
````

**What this does:**
- **Up**: Creates three tables (`expense_categories`, `expense_types`, `transactions`)
- **Down**: Would drop these tables (not shown in excerpt, but typically: `DROP TABLE IF EXISTS transactions, expense_types, expense_categories;`)
- **Transaction Safety**: `BEGIN`/`COMMIT` ensures all changes succeed or all fail together

### Example 2: Adding User Authentication

Looking at `20240717120000_add-users-table.sql`:

````sql
-- Up Migration
BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions
ADD COLUMN user_id INTEGER,
ADD CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE;

COMMIT;

-- Down Migration
BEGIN;
ALTER TABLE transactions
DROP CONSTRAINT fk_user,
DROP COLUMN user_id;
DROP TABLE IF EXISTS users;

COMMIT;
````

**What this demonstrates:**
- **Adding new tables** (`users`)
- **Modifying existing tables** (adding `user_id` to `transactions`)
- **Foreign key constraints** (linking transactions to users)
- **Reversibility** - the down migration removes everything in reverse order

### Example 3: Seeding Data

Looking at `20240305063429859_create-data-model.sql`:

````sql
-- Up Migration
BEGIN;

INSERT INTO expense_categories (category_name) VALUES 
('Income'),
('Personal Fixed Costs'),
('Personal Running Costs'),
('Housing Fixed Costs'),
('Travel Costs');

INSERT INTO expense_types (type_name, category_id) VALUES 
('Salary', 1),
('Bonus',1),
('Groceries', 2),
('Gym', 2),
-- ... more types
('Transportation',3);

INSERT INTO transactions (id, date, amount, type_id, category_id)
VALUES
    (6, '2024-01-02', 100.00, 21, 3),
    (7, '2024-01-02', 222.00, 14, 3),
    -- ... test data
    (75, '2024-02-17', 75.00, 15, 3);
COMMIT;
````

**What this does:**
- Populates lookup tables with reference data
- Inserts sample transactions for testing
- This is actually **seed data** mixed with migrations (see note below)

## How Migrations Are Applied

### The Runner Script

The `migrationRunner` function orchestrates everything:

````typescript
export async function migrationRunner(direction: 'up' | 'down'): Promise<void> {
  // 1. Connect to database
  const client = new pg.Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: 5432,
  });

  // 2. Configure migration options
  const options: RunnerOption = {
    dbClient: client,
    migrationsTable: 'migrations',  // Tracks which migrations ran
    dir: '../migrations',            // Where migration files live
    direction: direction,            // 'up' or 'down'
    singleTransaction: true,         // All-or-nothing
    // ... other options
  };

  await client.connect();
  
  try {
    // 3. Run migrations
    await runner(options);

    // 4. Apply seed files (SQL functions, views, etc.)
    const seedFiles = findSqlFiles('../seeds');
    for (const file of seedFiles) {
      const sql = fs.readFileSync(file).toString();
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}
````

### The Migrations Table

PostgreSQL tracks applied migrations in a special table:

| id | name | run_on |
|----|------|--------|
| 1 | 20240305063418723_create-main-tables | 2024-03-05 06:34:18 |
| 2 | 20240305063429859_create-data-model | 2024-03-05 06:34:29 |
| 3 | 20240717120000_add-users-table | 2024-07-17 12:00:00 |

**Why this matters:**
- Prevents running the same migration twice
- Ensures migrations run in chronological order
- Allows rollbacks to specific points

## Docker Integration

The migration process is automated via `docker-compose.yaml`:

````yaml
services:
  warehouse:
    image: postgres:13
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]
      
  db_migrations:
    build: ./database
    depends_on:
      warehouse:
        condition: service_healthy
    command: ["npm", "run", "migrate:up"]
````

**Execution flow:**
1. `warehouse` container starts PostgreSQL
2. Health check waits until DB is ready
3. `db_migrations` container runs automatically
4. Applies all migrations from `/database/migrations`
5. Applies all seed files from `/database/seeds`

## Seeds vs Migrations

Your project distinguishes between:

### Migrations (in `/migrations`)
- **Structure changes**: tables, columns, constraints
- **One-time execution**: tracked in `migrations` table
- **Versioned**: filename timestamps ensure order

### Seeds (in `/seeds/cashflow`)
- **SQL functions**: `get_financial_metrics`, `get_income_expense`
- **Re-runnable**: use `CREATE OR REPLACE FUNCTION`
- **Not tracked**: applied every time migrations run

Example seed file:

````sql
-- /seeds/cashflow/get_financial_overview.sql
CREATE OR REPLACE FUNCTION get_financial_metrics(p_user_id INT)
RETURNS TABLE(
    report_year TEXT,
    total_income_value DECIMAL,
    -- ... other columns
) AS $$
BEGIN
    RETURN QUERY
    WITH category_totals AS (
        -- Complex aggregation logic
    )
    SELECT ...
END;
$$ LANGUAGE plpgsql;
````

## Practical Usage

### Creating a New Migration

````bash
# In /database folder
npm run migrate create add-transaction-notes

# Creates: 20240320123456789_add-transaction-notes.sql
````

Then edit the file:

````sql
-- Up Migration
BEGIN;
ALTER TABLE transactions ADD COLUMN notes TEXT;
COMMIT;

-- Down Migration
BEGIN;
ALTER TABLE transactions DROP COLUMN notes;
COMMIT;
````

### Applying Migrations

````bash
# Apply all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down
````

### In Docker

````bash
# Start everything (auto-runs migrations)
docker-compose up -d

# View migration logs
docker logs db_migrations

# Manually rollback
docker exec db_migrations npm run migrate:down
````

## Key Takeaways

1. **Migrations = Database Version Control**: Every schema change is tracked and reversible
2. **Order Matters**: Timestamp prefixes ensure migrations run in sequence
3. **Transactions**: `BEGIN`/`COMMIT` make changes atomic (all-or-nothing)
4. **Separation**: Your project separates structure (migrations) from logic (seeds)
5. **Automation**: Docker Compose ensures migrations run before the app starts

This system allows you to evolve your database schema confidently, knowing you can always rollback if something goes wrong, and that every environment (dev, staging, prod) will have exactly the same structure.