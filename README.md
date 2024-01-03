# Gossip

Gossip is my submission for CVWO winter assignment AY23/24. It is hosted on AWS available at http://izngossip.ddns.net

## Getting Started

### Cloning the repo

```
git clone https://github.com/IzN432/gossip.git

cd gossip
```

### Setting up the PostgreSQL

1. Create a new database called gossip and run the SQL queries in database/database.sql
2. Rename template.env to .env and add your database username and password into the .env file
   
### Starting front end

1. Change to the /gossip/gossip-frontend directory:
    ```bash
    cd /gossip/gossip-frontend
    ```

2. Install packages:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    npm start
    ```

### Starting back end

1. Change to the /gossip directory:
    ```bash
    cd /gossip
    ```

2. Download dependencies:
    ```bash
    go download
    ```

3. Run the application in development mode:
    ```bash
    go run main.go -mode dev
    ```

The web app will be available at localhost:3000

## Features

### Authentication

- **/login:** Sign in to an existing account with an optional password.
- **/signup:** Create a new account with an optional password.

### Viewing Posts

- View all posts with options to:
  - Search
  - Filter by tag
  - Sort by hot or latest
  - Like posts
  - Edit and delete your own posts

- Click into each post to view it individually, opening the options to
  - Dislike
  - Reply
  - Edit and delete your own replies

### Creating Posts

- **/create:** Create new posts with a tag dialog to add existing tags and create new tags

### Editing Posts

- **/edit:** Edit existing posts that belong to you. Page is otherwise identical to create

### Corner Buttons

- **Top-left Button:** Brings you home or to the create post screen
- **Top-right Button:** Opens up account options, right now is only Logout
  
