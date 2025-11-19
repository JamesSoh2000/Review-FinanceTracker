JamesSoh2000: How is this function used in the project? Give me detailed example to fully understand how it's used.

Workspace: Collecting workspace information# How `get_income_expense` is Used in the Project

The `get_income_expense` SQL function is a **server-side database function** that calculates monthly income, expenses, and savings rate for a specific user. Let me walk you through exactly how it flows through the entire application.

---

## **Complete Data Flow**

### 1. **Database Function** (Where you are now)

The function is defined in get_income_expense.sql:

```sql
CREATE OR REPLACE FUNCTION get_income_expense(p_user_id INT)
RETURNS TABLE(
    dates TEXT,      -- '2024-01'
    category TEXT,   -- 'Income', 'Expense', or 'Savings'
    amount TEXT      -- Dollar amount or percentage
)
```

**What it returns:**
```
dates      | category | amount
-----------|----------|--------
2024-01    | Income   | 5000.00
2024-01    | Expense  | 3500.00
2024-01    | Savings  | 30.00    ← (1500/5000 * 100)
2024-02    | Income   | 5200.00
2024-02    | Expense  | 4000.00
2024-02    | Savings  | 23.08
```

---

### 2. **Backend Service Layer** (Business Logic)

The function is called from feed.service.ts:

```typescript
export const getIncomeExpenses = (userId: string) => {
    return query('SELECT * FROM get_income_expense($1)', [userId]);
};
```

**What happens here:**
- Takes the authenticated user's ID
- Executes the SQL function with user-specific filtering
- Returns raw database results

---

### 3. **Backend Controller Layer** (HTTP Handler)

The service is called from `backend/src/controllers/feed.ts`:

```typescript
export const getIncomeExpense = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).userId; // From JWT middleware
    
    const result = await feedService.getIncomeExpenses(userId);
    res.status(200).json(result.rows);
};
```

**What happens here:**
- Extracts `userId` from the authenticated request (JWT token)
- Calls the service function
- Sends JSON response to frontend

---

### 4. **Backend Route Definition** (API Endpoint)

The controller is registered in `backend/src/routes/feed.ts`:

```typescript
import { getIncomeExpense } from '../controllers/feed';
import isAuth from '../middleware/is-auth';

router.get('/income-expense', isAuth, getIncomeExpense);
```

**API Endpoint Created:**
```
GET http://localhost:8000/feed/income-expense
Authorization: Bearer <JWT_TOKEN>
```

---

### 5. **Frontend API Call** (React Component)

The function is ultimately used in dashboard components like `frontend/src/pages/cashflow/Row1.tsx`:

```typescript
const [incomeExpenseData, setIncomeExpenseData] = useState([]);

useEffect(() => {
    const fetchData = async () => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext.token}`
        };

        const response = await apiFetch(
            'http://localhost:8000/feed/income-expense',
            { headers },
            authContext
        );
        
        const data = await response.json();
        setIncomeExpenseData(data); // Store in component state
    };

    fetchData();
}, []);
```

---

### 6. **Frontend Data Visualization** (Charts)

The fetched data is displayed using **Recharts**:

```typescript
<ResponsiveContainer width="100%" height={400}>
    <AreaChart data={incomeExpenseData}>
        <XAxis dataKey="dates" />
        <YAxis />
        <Tooltip />
        <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#8884d8" 
            fill="#8884d8" 
            strokeWidth={2}
        />
    </AreaChart>
</ResponsiveContainer>
```

**Visual Result:**
A stacked area chart showing income vs expenses over time with savings rate overlay.

---

## **Complete Example Trace**

Let's trace a **real user action**:

### User Action:
User "john@example.com" (user_id = 5) logs in and views the dashboard.

### Step-by-Step Flow:

1. **Frontend Login** (`login/index.tsx`)
   ```typescript
   // User submits credentials
   POST /auth/login { email, password }
   
   // Backend responds with JWT
   { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", userId: 5 }
   
   // Frontend stores token in AuthContext
   ```

2. **Dashboard Loads** (`cashflow/Row1.tsx`)
   ```typescript
   useEffect(() => {
       // Component mounts, triggers API call
       GET /feed/income-expense
       Headers: { Authorization: "Bearer eyJhbG..." }
   }, []);
   ```

3. **Backend Middleware** (`middleware/is-auth.ts`)
   ```typescript
   // Verifies JWT token
   jwt.verify(token, SECRET) // → { userId: 5, email: "john@example.com" }
   
   // Attaches userId to request object
   req.userId = 5;
   ```

4. **Backend Controller** (`controllers/feed.ts`)
   ```typescript
   const userId = req.userId; // 5
   const result = await feedService.getIncomeExpenses(userId);
   ```

5. **Backend Service** (`services/feed.service.ts`)
   ```typescript
   query('SELECT * FROM get_income_expense($1)', [5])
   ```

6. **Database Execution**
   ```sql
   -- Filters transactions WHERE user_id = 5
   -- Groups by month and category
   -- Calculates savings rate
   -- Returns formatted results
   ```

7. **Response to Frontend**
   ```json
   [
     { "dates": "2024-01", "category": "Income", "amount": "5000.00" },
     { "dates": "2024-01", "category": "Expense", "amount": "3500.00" },
     { "dates": "2024-01", "category": "Savings", "amount": "30.00" },
     { "dates": "2024-02", "category": "Income", "amount": "5200.00" },
     { "dates": "2024-02", "category": "Expense", "amount": "4000.00" },
     { "dates": "2024-02", "category": "Savings", "amount": "23.08" }
   ]
   ```

8. **Frontend Renders Chart**
   - Recharts library transforms JSON into visual area chart
   - User sees their financial trends over time

---

## **Why Use a SQL Function?**

Instead of calculating in TypeScript, this approach:

1. **Leverages Database Power**: PostgreSQL is optimized for aggregations
2. **Reduces Network Traffic**: One query vs multiple queries + client-side calculations
3. **Maintains Data Integrity**: Calculations happen where the data lives
4. **Reusability**: Same function can be called by multiple endpoints
5. **Performance**: Database indexes and query optimization

---

## **Security Note**

Notice the **user-specific filtering**:
```sql
WHERE t.user_id = p_user_id
```

This ensures users only see their own data. The `p_user_id` comes from the **JWT token**, verified by `middleware/is-auth.ts`, preventing unauthorized access.

---

## **Summary**

```
User clicks Dashboard
    ↓
Frontend sends GET /feed/income-expense (with JWT)
    ↓
Middleware extracts userId=5 from JWT
    ↓
Controller calls feedService.getIncomeExpenses(5)
    ↓
Service executes: SELECT * FROM get_income_expense(5)
    ↓
PostgreSQL function calculates monthly income/expense/savings for user 5
    ↓
Returns JSON to frontend
    ↓
Recharts renders area chart visualization
```

This architecture separates concerns cleanly: **Database** handles complex calculations, **Backend** handles authentication/routing, **Frontend** handles visualization.