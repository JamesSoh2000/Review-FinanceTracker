Collecting workspace informationBased on your highlighted section on **Database Design & Setup**, here are the best prompts to deeply study these concepts in your workspace:

---

## 🎯 **Prompts for Database Design & Setup**

### **1. Understanding the Data Model**
```
Explain the database schema shown in /home/james/Personal/Money Tracking/Original Project/images/financeDM.png. What is the purpose of each table (users, transactions, expense_categories, expense_types) and how do they relate to each other?
```

### **2. Exploring Migrations**
```
Show me all migration files in /home/james/Personal/Money Tracking/Original Project/database/migrations/. Explain what each migration does and why migrations are important for database versioning.
```

```
Walk me through the migration file /home/james/Personal/Money Tracking/Original Project/database/migrations/20240305063429859_create-data-model.sql. What tables and relationships does it create?
```

### **3. Understanding Relationships**
```
Using the code in /home/james/Personal/Money Tracking/Original Project/database/migrations/, explain the one-to-many relationship between users and transactions. Why does each transaction need a user_id?
```

```
Explain the difference between expense_categories and expense_types in /home/james/Personal/Money Tracking/Original Project/database/migrations/. Why are they separate tables?
```

### **4. Migration Runner Deep Dive**
```
Explain how the migration runner works in /home/james/Personal/Money Tracking/Original Project/database/src/runner.ts. How does it find and execute SQL migration files?
```

```
What does the 'up' vs 'down' direction mean in the migrationRunner function in /home/james/Personal/Money Tracking/Original Project/database/src/runner.ts?
```

### **5. SQL Functions Study**
```
Show me the SQL function in /home/james/Personal/Money Tracking/Original Project/database/seeds/cashflow/get_financial_overview.sql. Explain what it does step by step and why functions are useful in PostgreSQL.
```

```
Compare the SQL functions in /home/james/Personal/Money Tracking/Original Project/database/seeds/cashflow/. What financial calculations do they perform and how do they use the database relationships?
```

### **6. Hands-On Practice**
```
Create a simple SQL query that would retrieve all transactions for a specific user from the schema in /home/james/Personal/Money Tracking/Original Project/database/migrations/. Explain the JOIN operations needed.
```

```
How would I add a new expense_type in the database schema from /home/james/Personal/Money Tracking/Original Project/database/migrations/? Show me the SQL INSERT statement.
```

### **7. Docker Database Setup**
```
Explain the database Dockerfile in /home/james/Personal/Money Tracking/Original Project/database/Dockerfile. How does it set up and run migrations?
```

```
How does the database service in /home/james/Personal/Money Tracking/Original Project/docker-compose.yaml connect to the backend? Explain the environment variables and networking.
```

---

## 📚 **Study Path Recommendation**

1. **Start with**: Data model visualization prompt (#1)
2. **Then explore**: Migration files (#2-3)
3. **Deep dive**: Migration runner mechanics (#4)
4. **Apply knowledge**: SQL functions (#5)
5. **Practice**: Hands-on queries (#6)
6. **Understand deployment**: Docker setup (#7)

These prompts will help you systematically understand how the database is structured, versioned, and deployed in your finance tracking application!