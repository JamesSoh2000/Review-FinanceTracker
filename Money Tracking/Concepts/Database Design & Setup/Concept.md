Collecting workspace information# Understanding Relational Databases and PostgreSQL in Your Finance Tracker

Let me explain in detail why a relational database like PostgreSQL is used in your finance tracker project, and break down the key concepts.

## Why PostgreSQL for This Project?

### 1. **Structured Financial Data**
Your finance tracker deals with highly structured, interconnected data:
- Users have many transactions
- Transactions belong to categories
- Categories contain types
- All relationships need to be maintained reliably

PostgreSQL excels at maintaining these relationships through **referential integrity** - ensuring that when you delete a user, their transactions are also deleted (CASCADE), and you can't create a transaction for a non-existent category.

### 2. **ACID Guarantees**
When dealing with financial data, you need:
- **Atomicity**: Either a transaction is fully saved or not at all (no partial saves)
- **Consistency**: Your database stays valid (e.g., can't have negative balances if that rule exists)
- **Isolation**: Multiple users can't interfere with each other's data
- **Durability**: Once saved, data won't be lost

PostgreSQL guarantees all of these, which is critical for financial applications.

---

## Core Database Concepts in Your Project

### **1. Tables**
Tables are like Excel spreadsheets - they store data in rows and columns. Your project has 4 main tables:

#### **users table** ([database/migrations/20240717120000_add-users-table.sql](Money Tracking/Original Project/database/migrations/20240717120000_add-users-table.sql))
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Breaking this down:**
- `id SERIAL PRIMARY KEY`: Auto-incrementing number that uniquely identifies each user
- `email VARCHAR(255)`: Text field up to 255 characters, must be UNIQUE (no two users with same email)
- `password_hash`: Stores the encrypted password (never plain text!)
- `created_at TIMESTAMP`: Automatically records when the user signed up

#### **transactions table** ([database/migrations/20240305063418723_create-main-tables.sql](Money Tracking/Original Project/database/migrations/20240305063418723_create-main-tables.sql))
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

**Key points:**
- `amount DECIMAL(10, 2)`: Stores monetary values with 2 decimal places (e.g., 123.45)
- `type_id` and `category_id`: These are **foreign keys** that link to other tables
- `FOREIGN KEY` constraints ensure you can't reference non-existent types or categories

#### **expense_categories table** ([database/migrations/20240305063418723_create-main-tables.sql](Money Tracking/Original Project/database/migrations/20240305063418723_create-main-tables.sql))
```sql
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);
```

This stores high-level categories like "Income", "Personal Fixed Costs", "Housing Fixed Costs"

#### **expense_types table**
```sql
CREATE TABLE IF NOT EXISTS expense_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);
```

This stores specific types within categories, like "Restaurants", "Groceries", "Salary"

---

### **2. Primary Keys**

A **primary key** uniquely identifies each row in a table. In your project, every table uses:

```sql
id SERIAL PRIMARY KEY
```

- `SERIAL` automatically generates sequential numbers: 1, 2, 3, 4...
- `PRIMARY KEY` ensures this value is unique and not null
- This allows you to reference specific records reliably

**Example:** User with `id=5` is always the same user, even if they change their email

---

### **3. Relationships**

#### **One-to-Many Relationships**

The most common relationship in your project is **one-to-many**:

**1. Users → Transactions** (One user has many transactions)

From [database/migrations/20240717120000_add-users-table.sql](Money Tracking/Original Project/database/migrations/20240717120000_add-users-table.sql):
```sql
ALTER TABLE transactions
ADD COLUMN user_id INTEGER,
ADD CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE;
```

**What this means:**
- Each transaction has ONE `user_id` that points to the users table
- Each user can have MANY transactions
- `ON DELETE CASCADE`: If you delete a user, all their transactions are automatically deleted too

**2. Categories → Types** (One category contains many types)

```sql
-- expense_types table
FOREIGN KEY (category_id) REFERENCES expense_categories(id)
```

- "Personal Fixed Costs" category contains types: "Groceries", "Gym", "Akasse"
- "Personal Running Costs" category contains types: "Restaurants", "Shopping", etc.

**3. Types → Transactions** (One type used in many transactions)

```sql
-- transactions table
FOREIGN KEY (type_id) REFERENCES expense_types(id)
```

- Type "Restaurants" (id=15) appears in many different transactions
- But each transaction has only ONE type

#### **Many-to-Many Relationships**

Your project doesn't currently use these, but they're worth understanding. A many-to-many would need a **junction table**.

**Example (not in your project):**
- Students can enroll in many courses
- Courses have many students
- You'd need a `enrollments` table: `student_id`, `course_id`

---

## How Data Flows in Your Project

### **Example: Creating a Transaction**

Let's trace what happens when a user adds a $50 restaurant expense:

**1. Frontend sends request** ([frontend/src/components/ExpenseFormModal.tsx](Money Tracking/Original Project/frontend/src/components/ExpenseFormModal.tsx))
```typescript
// User fills out form and clicks submit
{
  date: "2024-02-04",
  amount: 50.00,
  typeId: 15,      // "Restaurants" 
  categoryId: 3    // "Personal Running Costs"
}
```

**2. Backend controller receives it** ([backend/src/controllers/feed.ts](Money Tracking/Original Project/backend/src/controllers/feed.ts))
```typescript
export const postTransaction = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;  // From JWT token
    const { date, amount, typeId, categoryId } = req.body;
    
    const result = await feedService.createTransaction(
        date, amount, typeId, categoryId, userId
    );
    
    return res.status(201).json({ transaction: result.rows[0] });
};
```

**3. Service layer executes SQL** ([backend/src/services/feed.service.ts](Money Tracking/Original Project/backend/src/services/feed.service.ts))
```typescript
export const createTransaction = (
    date: string, 
    amount: number, 
    typeId: number, 
    categoryId: number, 
    userId: string
) => {
    return query(
        'INSERT INTO transactions (date, amount, type_id, category_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [date, amount, typeId, categoryId, userId]
    );
};
```

**4. PostgreSQL validates and inserts:**
- ✅ Checks `typeId=15` exists in `expense_types` table
- ✅ Checks `categoryId=3` exists in `expense_categories` table
- ✅ Checks `userId` exists in `users` table
- ✅ Validates `amount` is a valid decimal
- ✅ Inserts the row and returns it

If any foreign key reference is invalid, PostgreSQL **rejects** the entire operation.

---

## Why This Design is Powerful

### **1. Data Normalization**

Instead of storing category names repeatedly in every transaction:

```sql
-- ❌ BAD (unnormalized)
transactions:
id | date       | amount | category_name
1  | 2024-02-04 | 50.00  | Personal Running Costs
2  | 2024-02-05 | 25.00  | Personal Running Costs
3  | 2024-02-06 | 30.00  | Personal Running Costs
```

You reference IDs:

```sql
-- ✅ GOOD (normalized)
transactions:
id | date       | amount | category_id
1  | 2024-02-04 | 50.00  | 3
2  | 2024-02-05 | 25.00  | 3
3  | 2024-02-06 | 30.00  | 3

expense_categories:
id | category_name
3  | Personal Running Costs
```

**Benefits:**
- Less storage (storing "3" vs "Personal Running Costs" repeatedly)
- If you rename a category, change ONE row instead of thousands
- Prevents typos ("Personal Runing Costs" vs "Personal Running Costs")

### **2. Complex Queries Made Easy**

From [database/seeds/cashflow/get_financial_overview.sql](Money Tracking/Original Project/database/seeds/cashflow/get_financial_overview.sql):

```sql
SELECT 
    ec.category_name,
    TO_CHAR(t.date, 'YYYY') AS year,
    SUM(t.amount) AS total_amount
FROM transactions t
JOIN expense_categories ec ON t.category_id = ec.id
WHERE t.user_id = $1
GROUP BY ec.category_name, TO_CHAR(t.date, 'YYYY')
```

This single query:
- ✅ Filters transactions for ONE user only
- ✅ JOINs to get readable category names
- ✅ Groups by year and category
- ✅ Calculates totals per group

Try doing this efficiently in a spreadsheet with 10,000 transactions!

### **3. Data Integrity**

**Scenario:** You try to delete "Restaurants" type (id=15) but have 200 transactions using it.

PostgreSQL will **PREVENT** this deletion unless you:
1. First delete all transactions using that type, OR
2. Set `ON DELETE CASCADE` to auto-delete them

This prevents orphaned data (transactions pointing to non-existent types).

---

## Key Takeaways

1. **PostgreSQL is chosen for structure, relationships, and reliability** - critical for financial data
2. **Primary keys** uniquely identify records
3. **Foreign keys** create relationships and enforce data integrity
4. **One-to-many relationships** dominate your schema (users→transactions, categories→types, etc.)
5. **Normalization** reduces redundancy and makes updates safer
6. **JOINs** reconstruct full pictures from related tables
7. **Constraints** (UNIQUE, NOT NULL, FOREIGN KEY) prevent invalid data at the database level

The relational model means your data is **organized, validated, and queryable** - perfect for a finance tracker where accuracy and relationships matter!