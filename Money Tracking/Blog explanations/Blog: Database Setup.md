The project
The project is a personal finance management app that currently supports basic features, allowing users to manually insert financial transactions and view various financial metrics through plots, tables, and other visualizations on a ReactJS-based dashboard (work in progress).

Press enter or click to view image in full size

Personal finance management app reactJS dashboard
Technologies we use for this part are:

PostgreSQL
node-pg-migrate
Docker
Docker Compose
Data model
The first step is to design our data in a structured manner, enabling us to query it afterward. For this simple project, the data model consists of three tables and adheres to the 3-Normal Form (3NF) to ensure the database is optimized for efficiency and free from unnecessary redundancies:

Transactions: Fact table where all the financial transactions are stored.
Expense Categories: A dimension table that contains the IDs and names of the five major categories, such as personal fixed expenses, travel expenses, etc. This table helps to organise expenses into broad categories.
Expense Types: A dimension table that contains the IDs and names of subcategories (e.g., restaurants) that are linked to the main categories, facilitating a more granular classification of expenses.
Press enter or click to view image in full size

Expense Types and Expense Categories could easily be converted to Slowly Changing Dimension (SCD) type 2 tables if we decide to track changes over time. At the moment, and for the sake of simplicity, they work well as they are.

Migrations
After we have our data model in place, we need to implement it in the database. To manage database migrations and SQL objects in Postgres, I have been using node-pg-migrate. This tool allows for the precision and control over the database structure that I prefer, enabling the use of pure SQL for such tasks.

For more details about the tool you can check the docs.

Before we proceed with the migrations let’s ensure we have our folder structure in place by running the following commands (not at the same time).

mkdir database
cd database
npm init -y
npm install node-pg-migrate pg
npm install typescript ts-node @types/node --save-dev
npx tsc --init
After you have run the above you should have a package.json and tsconfig.json.

In package.json we add the following script:

"migrate": "node-pg-migrate --migration-filename-format utc -j sql",
In tsconfig.json we add the following:

"outDir": "./dist",
"rootDir": "./src", 
After we are done with installations, configurations etc. it’s time to create a migration script to build the tables we designed above by running the following command.

npm run migrate create create-main-tables
Now we should have a migrations folder and a file named like 20240305063418723_create-main-tables.sql .

In the script we add the three main tables: expense_categories, expense_types, and transactions. Each table is designed in a way ensuring that our data model adheres to the principles of normalisation for efficient data management.

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

-- Note: Including category_id in transactions for direct reference, though it could be inferred through expense_types
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
Second, after creating the tables, we populate the expense_categories and expense_types tables with predefined categories and types. This initial data set lays the foundation for categorizing transactions. Similarly, we create another migration script and add the following.

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
('Other Income',1),
('Groceries', 2),
('Gym', 2),
('Akasse', 2),
('Mobile Phone', 2),
('Subscription', 2),
('Other Housing', 2),
('Shopping Clothes', 3),
('Shopping Other', 3),
('Classes & Coaching', 3),
('Books', 3),
('Restaurants', 3),
('Fast Food', 3),
('Drinks', 3),
('Other Non Housing', 3),
('Rent', 4),
('Tickets', 5),
('Accommodation', 5),
('Travel Expenses', 5),
('Transportation',3);

COMMIT;

-- Down Migration
By structuring our database in this manner and carefully selecting our data types and relationships, we establish a robust foundation for our app. This approach not only facilitates the efficient storage and retrieval of financial data but also ensures the scalability and adaptability of the application to meet future requirements.

Seeds
In addition to migrations, our project leverages SQL scripts for creating non-migratory database objects such as Views, Materialized Views, User-Defined Functions (UDFs), and Stored Procedures. For this project, I’ve utilized two SQL functions (UDFs), which could have been implemented as views or materialized views. However, I plan to add parameters in the future, so I will maintain them as UDFs for now.

The first function is designed to retrieve annual financial metrics like net income, savings rate, and cumulative net income. Although the output is currently in a tabular format, PostgreSQL also supports returning JSON objects, offering flexibility in how data is presented.

Get George Zefkilis’s stories in your inbox
Join Medium for free to get updates from this writer.

Enter your email
Subscribe
Note, for applying such SQL objects we need to create the sql files manually in a different folder. In my case under seeds/cashflow.

CREATE OR REPLACE FUNCTION get_financial_metrics()
RETURNS TABLE(
    report_yearly TEXT,
    total_income_value DECIMAL,
    expense_category VARCHAR,
    total_expense_value DECIMAL,
    total_yearly_expenses DECIMAL,
    net_income_value DECIMAL,
      cumulative_net_income_value DECIMAL,
    savings_rate_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH category_totals AS (
        SELECT 
            ec.category_name,
            TO_CHAR(t.date, 'YYYY') AS year,
            SUM(t.amount) AS total_amount,
            CASE 
                WHEN ec.category_name = 'Income' THEN 'Income'
                ELSE 'Expense'
            END AS type
        FROM transactions t
        JOIN expense_categories ec ON t.category_id = ec.id
        GROUP BY ec.category_name, TO_CHAR(t.date, 'YYYY')
    ),
    income_total AS (
        SELECT 
            year,
            SUM(total_amount) AS total_income
        FROM category_totals
        WHERE type = 'Income'
        GROUP BY year
    ),
    expense_total AS (
        SELECT 
            year,
            category_name,
            SUM(total_amount) AS total_expense
        FROM category_totals
        WHERE type = 'Expense'
        GROUP BY year, category_name
    ),
    yearly_expenses AS (
        SELECT
            year,
            SUM(total_expense) AS total_yearly_expenses
        FROM expense_total
        GROUP BY year
    ),
    net_income AS (
        SELECT 
            i.year,
            (i.total_income - COALESCE(m.total_yearly_expenses, 0)) AS total_net_income
        FROM income_total i
        JOIN yearly_expenses m ON i.year = m.year
    ),
      cumulative_net_income AS (
        SELECT 
            year,
            SUM(total_net_income) OVER (ORDER BY year) AS cumulative_income
        FROM net_income
    )
    SELECT 
        i.year AS report_year,
        i.total_income AS total_income_value,
        e.category_name AS expense_category,
        (e.total_expense / NULLIF(i.total_income, 0)) * 100 AS total_expense_value,
        (m.total_yearly_expenses / NULLIF(i.total_income, 0)) * 100 AS total_yearly_expenses,
        n.total_net_income  AS net_income_value,
        c.cumulative_income AS cumulative_net_income_value, 
        (n.total_net_income / NULLIF(i.total_income, 0)) * 100 AS savings_rate_value
    FROM income_total i
    JOIN expense_total e ON i.year = e.year
    JOIN yearly_expenses m ON i.year = m.year
    JOIN net_income n ON i.year = n.year
    JOIN cumulative_net_income c ON i.year = c.year
    ORDER BY i.year, e.category_name;
END;
$$ LANGUAGE plpgsql;
The second UDF calculates income, expenses, and savings on a monthly basis. This function is crucial for providing a detailed monthly financial overview, supporting more granular analysis and budgeting.

CREATE OR REPLACE FUNCTION get_income_expense()
RETURNS TABLE(
    dates TEXT,
    category TEXT,
    amount TEXT
) AS $$
BEGIN 
    RETURN QUERY
      WITH cat AS (
            SELECT 
                id,
                CASE 
                    WHEN category_name <> 'Income' THEN 'Expense'
                    ELSE 'Income'
                END AS names
            FROM expense_categories
        ), monthly_totals AS (
            SELECT 
                SUM(t.amount) AS total, 
                TO_CHAR(t.date, 'YYYY-MM') AS time,
                ec.names 
            FROM transactions t 
            JOIN cat ec ON ec.id = t.category_id 
            GROUP BY 2, 3
        ), monthly_income_expense AS (
            SELECT 
                time,
                MAX(CASE WHEN names = 'Income' THEN total ELSE 0 END) AS income,
                MAX(CASE WHEN names = 'Expense' THEN total ELSE 0 END) AS expense
            FROM monthly_totals
            GROUP BY time
        )
        SELECT 
            time as dates,
            'Income' AS category,
            income::text AS amount
        FROM monthly_income_expense
        UNION ALL
        SELECT 
            time as dates,
            'Expense' AS category,
            expense::text AS amount
        FROM monthly_income_expense
        UNION ALL
        SELECT 
            time as dates,
            'Savings' AS category,
            ROUND( ( (income - expense)/income ) * 100, 2)::text AS amount
        FROM monthly_income_expense
        ORDER BY dates, category;
END;
$$ LANGUAGE plpgsql;
These functions are integral to our data model, enabling sophisticated analytics queries that fetch specific values from the database. These values will later be used in the UI to present actionable insights to the user.

Apply migrations
Now that our migrations and SQL objects are ready, we need to establish a method to apply them. The script outlined below achieves this by first applying the migrations. It then proceeds to iterate through a specified folder (e.g., ‘seeds’) to apply the remaining SQL objects..

import runner, { RunnerOption } from 'node-pg-migrate';
import pg from 'pg';
import fs from 'fs';
import path from 'path';


function findSqlFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSqlFiles(filePath, fileList);
    } else if (path.extname(file) === '.sql') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

export async function migrationRunner(direction: 'up' | 'down'): Promise<void> {
  process.chdir(__dirname);
  const client = new pg.Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: 'tracker',
    port: 5432,
 
  });

  const options: RunnerOption = {
    dbClient: client,
    migrationsTable: 'migrations',
    migrationsSchema: 'public',
    schema: 'public',
    dir: '../migrations',
    checkOrder: true,
    direction: direction,
    singleTransaction: true,
    createSchema: false,
    createMigrationsSchema: false,
    noLock: false,
    fake: false,
    dryRun: false,

    verbose: false,
    decamelize: false,
  };

  await client.connect();
  console.log(`Connected to DB ${process.env.PGDATABASE}`);
  
  try {
    await runner(options);

    // Applying seeds
    const seedFiles = findSqlFiles('../seeds');
    for (const file of seedFiles) {
      console.log(`Applying seed file: ${file}`);
      const sql = fs.readFileSync(file).toString();
      await client.query(sql);
      console.log(`Successfully applied ${file}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error during migration or seeding: ', err.stack);
    } else {
      console.error('An unexpected error occurred', err);
    }
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}
Then, we can execute the script through a wrapper (see below), which allows us to pass parameters that define the direction of the migrations: ‘up’ for creating and ‘down’ for removing migrations (RollBack).

import { migrationRunner } from './runner';

(async () => {
  try {
    const direction = process.argv[2] === 'down' ? 'down' : 'up';
    await migrationRunner(direction);
    console.log(`Migrations have been ${direction === 'up' ? 'applied' : 'rolled back'} successfully.`);
  } catch (error) {
    console.error(`An error occurred while running the ${process.argv[2]} migration: `, error);
  }
})();
Next, we will configure our package.json to include the following scripts:

"scripts": {
    "build": "rimraf ./dist && tsc",
    "migrate": "node-pg-migrate --migration-filename-format utc -j sql",
    "migrate:up": "node ./dist/runMigrations.js up",
    "migrate:down": "node ./dist/runMigrations.js down"
    
  }
Lastly, we construct our Dockerfile.

FROM node:14

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["npm", "migrate:up"]
To deploy our database alongside the previously mentioned definitions, we will utilize Docker Compose.

Deploy
For our PostgreSQL setup, we utilize the official Docker image and configure our environment using a docker-compose.yaml file.

Below is the definition of the warehouse and db-migration services within the docker-compose.yaml file:

version: '3.8'
services:
  warehouse:
    container_name: warehouse
    image: postgres:13
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: tracker
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]
      interval: 5s
      retries: 5
    restart: always
    ports:
      - "5432:5432"

  db_migrations:
    container_name: db_migrations
    build: ./database
    depends_on:
      warehouse:
        condition: service_healthy
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_HOST: ${POSTGRES_HOST}
      POSTGRES_DB: tracker
    command: ["npm", "run", "migrate:up"]
volumes:
  postgres-data:
Key components explained:

container_name: Assigns a name to the container, here warehouse, for easy reference.
image: Specifies the Docker image to use, in this case, postgres:13 for PostgreSQL version 13.
environment: Sets environment variables for the PostgreSQL server. These variables are sourced from a .env file.
volumes: Mounts host files/directories and defines named volumes for persistent data storage and initialization scripts.
healthcheck: Configures checks to ensure the PostgreSQL server is ready to accept connections.
restart: Ensures the container automatically restarts if it stops.
ports: Maps port 5432 inside the container to the same port on the host, making the database accessible externally.
build: Specifies the path to the Dockerfile for the corresponding service
command: Defines the command that will execute when the container starts, overriding the default specified in the Dockerfile.
depend_on: Outlines the dependencies among the services, including conditions that must be met before they are run.
Launching and Managing the Container:

To start the containers, run docker-compose up -d. This command starts all the defined services in detached mode, allowing them to run in the background.

After the containers have started, you should observe the following messages in the logs:

Press enter or click to view image in full size

If you establish a connection to DBeaver and navigate to the ‘Tables’ section, you should be able to view the tables we previously created, as well as the migrations table.


Then, you can query the migrations table, and you will find that the migrations we created are present.

Press enter or click to view image in full size

Ultimately, to stop and remove the container (and optionally the volume with -v), execute docker-compose down.

This setup provides a robust and flexible environment for developing and testing applications with PostgreSQL. Additionally, using a dedicated database management tool helps us to manage and apply schema changes and data transformations in a controlled and versioned manner.

Conclusion
Interacting with the database is a fundamental aspect of every application. Thus, it’s crucial to invest effort designing it in a manner that not only facilitates efficient data read and write operations but also aligns perfectly with the scope of your project.

In this post, we explored how to design a data model for a financial application. We covered the creation of scripts for setting up tables and seeding data using node-pg-migrate, and we outlined the process for deploying our database using dockerand docker-compose.

In the second part, we will delve into building a simple REST API using NodeJS, ExpressJS, and TypeScript. This API will serve as the communication layer between our database and the application, ensuring that data flows seamlessly across the system.