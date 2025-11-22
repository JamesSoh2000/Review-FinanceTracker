# Export Data from Docker Compose to the host(local) machine into CSV file

JamesSoh2000: # Connect to the warehouse container
docker exec -it warehouse psql -U admin -d tracker

# Inside psql, export to CSV
\copy (SELECT * FROM transactions) TO '/tmp/transactions.csv' WITH CSV HEADER;

# Or export to JSON (PostgreSQL 9.2+)
\copy (SELECT json_agg(t) FROM (SELECT * FROM transactions) t) TO '/tmp/transactions.json';

# Exit psql
\q

# Copy CSV file
docker cp warehouse:/tmp/transactions.csv ./transactions.csv

Give me detailed explanation how each command works. Be specific as possible since I am not proficient at Docker and PostgreSQL command lines.

GitHub Copilot: # Detailed Explanation of Docker and PostgreSQL Commands

## 1. Connect to PostgreSQL in Docker Container

```bash
docker exec -it warehouse psql -U admin -d tracker
```

**Breaking it down:**

- `docker exec` - Execute a command in a running Docker container
- `-it` - Two flags combined:
  - `-i` (interactive) - Keep STDIN open even if not attached, allowing you to type input
  - `-t` (tty) - Allocate a pseudo-terminal, which provides a command-line interface
- `warehouse` - The name of your Docker container
- `psql` - PostgreSQL interactive terminal (command-line client)
- `-U admin` - Connect as the PostgreSQL user named "admin"
- `-d tracker` - Connect to the database named "tracker"

**What happens:** This command opens an interactive PostgreSQL shell inside your Docker container.

---

## 2. Export to CSV (inside psql)

```sql
\copy (SELECT * FROM transactions) TO '/tmp/transactions.csv' WITH CSV HEADER;
```

**Breaking it down:**

- `\copy` - A psql meta-command (client-side operation, runs from the client machine)
- `(SELECT * FROM transactions)` - The SQL query to get all data from the transactions table
- `TO transactions.csv'` - Save to this file path **inside the Docker container**
- `WITH CSV` - Format the output as CSV (Comma-Separated Values)
- `HEADER` - Include column names as the first row

**Important:** `\copy` writes the file **inside the container's filesystem**, not your host machine.

---

## 3. Export to JSON (Alternative)

```sql
\copy (SELECT json_agg(t) FROM (SELECT * FROM transactions) t) TO '/tmp/transactions.json';
```

**Breaking it down:**

- `json_agg(t)` - PostgreSQL function that aggregates rows into a JSON array
- Inner `SELECT * FROM transactions` - Gets all transaction data
- Aliased as `t` - The subquery result is named 't' for the outer query
- Result: Creates a single JSON array containing all transaction rows

**Note:** This creates one large JSON array, not JSON Lines format.

---

## 4. Exit PostgreSQL

```bash
\q
```

**What it does:** Quit the psql interactive terminal and return to the Docker container's shell (or your host terminal).

---

## 5. Copy File from Container to Host

```bash
docker cp warehouse:/tmp/transactions.csv ./transactions.csv
```

**Breaking it down:**

- `docker cp` - Copy files/folders between a container and the local filesystem
- `warehouse:/tmp/transactions.csv` - Source: file path inside the "warehouse" container
- transactions.csv - Destination: current directory on your host machine

**What happens:** This extracts the CSV file from inside the Docker container to your actual computer's filesystem.

---

## Key Differences to Understand

**`\copy` vs `COPY`:**
- `\copy` - Client-side command, file is on the client (but when run inside docker exec, the client is the container)
- `COPY` - Server-side SQL command, requires superuser privileges, file must be on the server

**File Locations:**
- transactions.csv - Inside the container
- transactions.csv - On your host machine in the current directory

**Why the two-step process:**
1. First create the file inside the container (`\copy`)
2. Then copy it out to your host machine (`docker cp`)

JamesSoh2000: When you connect to PostgreSQL in Docker container, how can you view the data in a table format?

GitHub Copilot: # Viewing Data in Table Format in PostgreSQL

When connected to PostgreSQL via `docker exec -it warehouse psql -U admin -d tracker`, you can view data in table format using these commands:

## Basic SELECT Query

```sql
SELECT * FROM transactions;
```

**What it does:** Displays all columns and rows from the transactions table in a formatted table.

---

## Limit the Number of Rows

```sql
SELECT * FROM transactions LIMIT 10;
```

**What it does:** Shows only the first 10 rows (useful for large tables).

---

## View Specific Columns

```sql
SELECT id, date, amount, type_id FROM transactions;
```

**What it does:** Shows only the specified columns, making the output narrower and easier to read.

---

## Order the Results

```sql
SELECT * FROM transactions ORDER BY date DESC LIMIT 20;
```

**What it does:** Shows the 20 most recent transactions (sorted by date, newest first).

---

## psql Display Settings

You can also control how psql displays tables:

```sql
-- Enable expanded display (vertical format, one column per line)
\x

-- Then run your query
SELECT * FROM transactions LIMIT 5;

-- Toggle back to table format
\x
```

**`\x` (expanded display):** Shows each row vertically instead of horizontally. Useful when you have many columns.

---

## Adjust Column Display

```sql
-- Set pager to less (allows scrolling through large results)
\pset pager on

-- Turn off pager (all output prints at once)
\pset pager off

-- Set format to aligned (default table format)
\pset format aligned
```

---

## Example Session

```sql
-- See first 10 transactions in table format
SELECT * FROM transactions ORDER BY id LIMIT 10;

-- View specific columns for better readability
SELECT id, date, amount FROM transactions WHERE user_id = 1;

-- Use expanded display for detailed view of one record
\x
SELECT * FROM transactions WHERE id = 1;
\x
```

**Tip:** Press `q` to quit the pager if your results are too long and you're stuck in the viewing mode.

JamesSoh2000: When you select the data like this way

SELECT * FROM transactions WHERE user_id IS NULL;

Why don't we use user_id = NULL?

GitHub Copilot: # Why `IS NULL` instead of `= NULL`

## The Reason: NULL is NOT a Value

In SQL, `NULL` represents the **absence of a value** or **unknown data**. It's not equal to anything, not even itself.

## Why `= NULL` Doesn't Work

```sql
-- This will NEVER return any rows (always evaluates to UNKNOWN)
SELECT * FROM transactions WHERE user_id = NULL;

-- This is the correct way
SELECT * FROM transactions WHERE user_id IS NULL;
```

**Explanation:**

When you use `= NULL`:
- SQL evaluates `user_id = NULL` as **UNKNOWN** (not TRUE or FALSE)
- The WHERE clause only returns rows where the condition is TRUE
- Since `= NULL` is UNKNOWN, no rows are returned

## NULL Comparison Logic

```sql
-- All of these evaluate to UNKNOWN (not TRUE)
SELECT NULL = NULL;      -- UNKNOWN
SELECT NULL <> NULL;     -- UNKNOWN
SELECT NULL > NULL;      -- UNKNOWN
SELECT 5 = NULL;         -- UNKNOWN
```

**Three-valued logic:** SQL uses TRUE, FALSE, and UNKNOWN (not just TRUE/FALSE).

## Correct NULL Operations

```sql
-- Check for NULL values
SELECT * FROM transactions WHERE user_id IS NULL;

-- Check for non-NULL values
SELECT * FROM transactions WHERE user_id IS NOT NULL;

-- Count NULL values
SELECT COUNT(*) FROM transactions WHERE user_id IS NULL;
```

## Looking at Your Data

From your CSV, these rows have NULL user_id (empty column):
- Row 7: `7,2024-01-02,222.00,14,3,` ← no user_id
- Row 9: `9,2024-01-07,152.00,4,2,` ← no user_id
- And many others in 2024

Using `IS NULL` will find these rows correctly.

## Summary

- `IS NULL` - Special operator to check if a value is NULL ✓
- `= NULL` - Always evaluates to UNKNOWN, never returns rows ✗
- `IS NOT NULL` - Check if a value exists ✓

**Think of it this way:** You can't ask "does this equal unknown?" You ask "is this unknown?"

JamesSoh2000: How can I set a specific column with a value I want in SQL command

GitHub Copilot: # Setting Column Values with SQL UPDATE

## Update All Rows to Same Value

```sql
-- Set user_id to 1 for ALL rows
UPDATE transactions SET user_id = 1;
```

**Warning:** This updates **every row** in the table!

---

## Update Specific Rows with WHERE Clause

```sql
-- Set user_id to 1 only for rows where user_id is NULL
UPDATE transactions SET user_id = 1 WHERE user_id IS NULL;

-- Set user_id to 2 for specific transaction IDs
UPDATE transactions SET user_id = 2 WHERE id IN (7, 9, 11);

-- Set user_id based on date
UPDATE transactions SET user_id = 1 WHERE date >= '2024-01-01';
```

---

## Update Multiple Columns at Once

```sql
-- Update multiple columns in one command
UPDATE transactions 
SET user_id = 1, 
    category_id = 2 
WHERE user_id IS NULL;
```

---

## Update Based on Another Column's Value

```sql
-- Set user_id to 1 where category_id is 3
UPDATE transactions SET user_id = 1 WHERE category_id = 3;

-- Set user_id to 2 where amount is greater than 1000
UPDATE transactions SET user_id = 2 WHERE amount > 1000;
```

---

## For Your Specific Data

Looking at your CSV, you have NULL user_id values in 2024 rows. To fix them:

```sql
-- Set all NULL user_id values to 1
UPDATE transactions SET user_id = 1 WHERE user_id IS NULL;

-- Or set based on year
UPDATE transactions 
SET user_id = 1 
WHERE date < '2025-01-01' AND user_id IS NULL;
```

---

## Check Before Updating (Best Practice)

```sql
-- Step 1: Preview which rows will be affected
SELECT * FROM transactions WHERE user_id IS NULL;

-- Step 2: If it looks good, run the update
UPDATE transactions SET user_id = 1 WHERE user_id IS NULL;

-- Step 3: Verify the update worked
SELECT * FROM transactions WHERE user_id = 1;
```

---

## Update with Calculations

```sql
-- Increase all amounts by 10%
UPDATE transactions SET amount = amount * 1.10;

-- Add 5 to category_id for specific rows
UPDATE transactions SET category_id = category_id + 5 WHERE id < 10;
```

---

## General Syntax

```sql
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
```

**Always use WHERE unless you want to update ALL rows!**