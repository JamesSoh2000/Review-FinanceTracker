Technologies we use for this part are:

    Node.js
    Express.js
    Typescript
    Docker
    Docker-compose

Node.js, Express.js and Typescript form a powerful combination for building efficient and scalable web applications. Node.js brings a high-performance JavaScript environment for server-side logic, Express.js simplifies web server creation with its minimalistic and powerful framework, and TypeScript enhances code reliability and maintainability with its static typing system. Following the development, we’ll deploy the API and accompanying services using Docker and Docker-compose, ensuring a smooth integration and deployment process.
RESTful API

To kick off our RESTful API development, the first step is to organize our project’s structure. Follow these commands to create a new backend directory, initialize a Node.js project, and install the necessary packages:

Create the backend directory and navigate into it:

mkdir backend
cd backend

Initialize a new Node.js project with default settings:

npm init -y

Install Express for our web server framework:

npm install --save express

Add TypeScript for static typing, along with ts-node for running TypeScript files directly, and @types/node for Node.js type definitions:

npm install typescript ts-node @types/node --save-dev

Initialize a TypeScript configuration file:

npx tsc --init

After completing the initial setup steps, your backend directory will contain two key configuration files: package.json and tsconfig.json. These files are essential for defining project dependencies and TypeScript compiler options, respectively.

Next, we need to configure TypeScript to organize our compiled JavaScript files and source TypeScript files efficiently. This organization aids in maintaining a clean project structure, especially as the application grows.

Open the tsconfig.json file and modify it to include the following settings under the compilerOptions section.

{
  "compilerOptions": {
    ...
    "outDir": "./dist",
    "rootDir": "./src",
    ...
  }
}

Next, we’ll structure our application by creating specific folders and files to organize our code logically. This step is crucial for maintaining a clean and manageable codebase as our project grows. Here’s what we need to do:

    Controllers: Create a controllers directory. This is where we'll store our command files. Controllers will handle the incoming requests and delegate them to the appropriate services or directly respond to the client.
    Routes: Create a routes directory. Here, we'll define the routes that direct incoming requests to the corresponding controller commands. It acts as the entry point for our API endpoints.
    Database Connection (db_conn): Create a db_conn directory. This will contain the code to establish a connection to our database. Keeping database connections in a separate directory helps in isolating the database logic, making it easier to manage and modify.
    Server Entry Point (tracker.ts): Finally, create a tracker.ts file in the root of the src directory. In this file, we'll configure the server, including what port it should listen on. This file will also include the setup to execute our command routes and any middleware we need.

Overall the project should look like this:

backend/
│   package.json
│   tsconfig.json
└───src/
    │   tracker.ts
    ├───controllers/
    ├───routes/
    └───db_conn/

Perfect!!!
Get George Zefkilis’s stories in your inbox

Join Medium for free to get updates from this writer.

Now that we have everything in place (If you haven’t set up the database you can check this post) we can start building our API.

Let’s first create the connection with the database by creating a db.ts file inside db_conn folder and add the following:

// db.ts: Establishing a pool for PostgreSQL connections
import { Pool, QueryResult } from 'pg';

// Configure the pool with environment variables for security
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: 'tracker',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Export a query function for executing queries through the pool
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
    return pool.query(text, params || []);
  };

It exports a query function that other parts of the application can use to interact with the database. This centralizes our database interaction logic, making it easy to manage connections and queries from a single location.

In the controllers fodler we will create a feed.ts file. This file contains the business logic for specific operations, like fetching expense categories from the database. For example our script can look like this(more operations can be defined):

import { Request, Response, NextFunction } from 'express';
import { query } from '../db_conn/db'

// function to get the expenses
export const getExpenseCategories = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await query('SELECT id, category_id, type_name FROM expense_types');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching expense categories' });
  }
};

Then in the routes folder we create afeed.ts file. This routes file imports the controllers and associates them with specific HTTP endpoints. For example, it maps the /expense-categories endpoint to the getExpenseCategories controller function. This setup defines the entry points for our API, directing incoming requests to the appropriate controller based on the URL and HTTP method.

import express from 'express';
import * as feedController from '../controllers/feed';

const router= express.Router()

// Get /feed/expense-categories
router.get('/expense-categories', feedController.getExpenseCategories);

....

export default router;

Lastly we have our server entry point tracker.ts . This is the main file that sets up and starts our Express server. It imports and uses the routes from the routes directory, applies middleware like body-parser for parsing JSON request bodies and cors for handling Cross-Origin Resource Sharing. It also sets some basic HTTP headers for all responses and specifies the server's listening port. Finally, it mounts our route handlers (e.g., feedRoutes) to specific paths, making them accessible via defined endpoints. The script looks like this.

import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import feedRoutes from './routes/feed';

const port = process.env.PORT || 8000

const app: Express = express();

app.use(cors())

app.use(bodyParser.json()); // application/json

app.use((_req: Request, res: Response, next: NextFunction)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})
app.use('/feed', feedRoutes);

app.listen(port);

Amazing! We have now established the foundation for our API. The next step involves updating our package.json to define the scripts we intend to run, ensuring our project's tasks are easily manageable through npm commands. Our updated package.json includes the following scripts for development, building, and production:

{
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "tsc -w & nodemon ./dist/tracker.js",
  "start": "node ./dist/tracker.js",
  "build": "rimraf ./dist && tsc",
  "start:prod": "node ./dist/tracker.js"
}

With our scripts configured, we are ready to containerise our application using Docker. This allows our application to run consistently across any environment. To achieve this, we create a Dockerfile in the root directory of our project. The Dockerfile outlines the steps to build our application’s Docker image, which includes installing dependencies, building our TypeScript project, and setting the command to start the application. Here’s how our Dockerfile looks:

# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source inside Docker image
COPY . .
RUN npm run build

# Make port available to the world outside this container
EXPOSE 8000

# Define the command to run your app
CMD npm run start:prod

App deployment

We are nearly at the stage where we can start testing our API. However, our API doesn’t work in isolation, it operates in conjunction with our database (and eventually with our frontend). To facilitate this integrated operation, we’ll deploy our entire stack using docker-compose. This approach builds upon the docker-compose.yml file created in the previous post, expanding it to include our backend service. We'll update the docker-compose.yml file as follows:

version: '3.8'
services:
  backend:
    container_name: backend
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_HOST=${POSTGRES_HOST}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - PORT=${PORT}
    depends_on:
      - warehouse

  warehouse:
    # Add the setting from previous post

  db_migrations:
    # Add the setting from previous post
volumes:
  postgres-data:

The warehouse and db_migrations services should be configured as described in the previous post. Their settings are crucial for the database setup and migrations necessary for the API to function correctly.

With the docker-compose.yml file updated, we can launch our entire stack by running:

docker-compose up -d

This command starts all the defined services in detached mode, allowing them to run in the background. Once the stack is up, we can test the API endpoints (assuming there’s some data in your database) using tools like Postman. For example, accessing the /feed/expense-categories endpoint should return the predefined data inserted into the database during setup.
Press enter or click to view image in full size
Data return in Postman
Conclusion

In this post we went through the steps required to structure, develop, and deploy a RESTful API utilizing Node.js, Express.js, and TypeScript, all within a Dockerized environment. The setup we’ve explored sets up a strong foundation for a simple but effective API. It creates efficient and robust communication between our database and the frontend, enabling us to monitor our financial data with ease.

While what we’ve constructed is foundational, the world of API development offers much more to enhance and secure our applications.such as implementing authentication mechanisms, integrating webhooks, and more. These extensions can further refine and fortify our application, tailoring it to meet specific needs and challenges.

Lastly, although we haven’t applied here, never forget to TEST your code ;)