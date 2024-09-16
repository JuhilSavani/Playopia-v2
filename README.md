# My Innovative Assignment

![Preview](preview.png)

## Folder Structure

- **public:** Contains static assets like images, styling files etc.
- **views:** Contains the EJS templates for rendering pages.
- **index.js:** Entry point of the application.

<br/>

## Prerequisites

Before you begin, ensure that you have the following installed on your machine:

- **Node.js** (v14.x or higher): Required to run the server and client applications.
- **npm** (v6.x or higher) or **yarn** (v1.x or higher): Package managers to install dependencies.
- **PostgreSQL**: The database used for storing user information. Ensure you have it installed and set up locally or have access to a remote PostgreSQL instance.
- **pgAdmin**: Optional, but recommended for managing your PostgreSQL database.

With these prerequisites in place, you’ll be ready to set up and run the project(or implementation).


## Database Setup 

This project uses PostgreSQL as its database management system. Follow the steps below to set up the database and create the necessary table.

### 1. Launch pgAdmin

- Open pgAdmin from your applications menu.
- Connect to your PostgreSQL server instance. If you haven't set up a server connection, follow the prompts to add a new server connection.

### 2. Create a New Database

- In the pgAdmin interface, right-click on the `Databases` node in the tree view and select `Create` > `Database...`
- Enter the name of your new database (e.g., `playopia_db`) and click `Save`.

### 3. Create Necessary Tables

- Copy and paste the following SQL queries into the query editor and run these queries:

```sql
   CREATE TABLE playopia (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
  
  -- Creating index on username
  CREATE INDEX idx_username ON playopia(username);
  
  -- Creating index on email
  CREATE INDEX idx_email ON playopia(email);
  
  CREATE TABLE session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
  ) WITH (OIDS=FALSE);
  
  -- Creating index on expire
  CREATE INDEX "IDX_session_expire" ON session (expire);
```

<br/>

## Environment Variables
To run the application, ensure you have the following environment variables set up:
- `SESSION_SECRET`: The secret key for managing session data.
- `PG_HOST`: PostgreSQL host.
- `PG_PORT`: PostgreSQL port.
- `PG_DATABASE`: PostgreSQL database name.
- `PG_USER`: PostgreSQL user.
- `PG_PASSWORD`: PostgreSQL password.
- `SALT_ROUNDS`: The number of salt rounds for bcrypt.
  
## How to use

1. Clone/Download the repo.
2. Open your terminal or command prompt and navigate to the project directory.
3. To install dependencies run `npm install`.
4. After installing dependencies, run `npm start`.
5. Access the application at [http://localhost:3000](http://localhost:3000) in your web browser.

<br/>

## Statefull User Authentication: Sessions & Cookies

- When a user visits a website, a unique session ID is generated and stored in a session cookie. This session ID is used to identify the user's session on the server side.

- Essentially, session data is stored on the server side. Only a session identifier (usually a session ID) is stored on the client side, often in a cookie. The actual data associated with the session is stored on the server-side.
	
- When a user revisits the website, their browser automatically sends the session cookie containing the unique session ID back to the server. The server then retrieves the corresponding session data using this ID, allowing the user to resume their session seamlessly.
	
- After the user's session expires or they log out, the browser no longer sends the session ID to the server with subsequent requests. As a result, the server cannot associate subsequent requests with the original session.


## Contributing
Contributions are welcome! If you'd like to improve this project, please fork the repository and submit a pull request.
