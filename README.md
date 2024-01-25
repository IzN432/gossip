# Gossip

Gossip is my submission (Isaac Ng Jun Jie) for CVWO winter assignment AY23/24. It is hosted on AWS available at http://izngossip.ddns.net. It supports mobile.
<br /><br />
If dynamic DNS is blocked, can use this IP address instead http://ec2-54-169-38-181.ap-southeast-1.compute.amazonaws.com

## Getting Started

### Cloning the repo

```
git clone https://github.com/IzN432/gossip.git

cd gossip
```

### Setting up the PostgreSQL

1. Download postgreSQL and setup a database
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

1. Change to the /gossip/gossip-backend directory:
    ```bash
    cd /gossip/gossip-backend
    ```

2. Download dependencies:
    ```bash
    go install
    ```

3. Run the application in development mode:
    ```bash
    go run main.go --mode dev
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
  
## Hosting

1. Change to /gossip
   ```bash
   cd gossip
   ```
2. Build the docker images
   ```bash
   docker build -t gossip-frontend:latest ./gossip-frontend
   docker build -t gossip-backend:latest ./gossip-backend
   ```
3. Upload these images to your instance or just run it locally. I used AWS ECR but the simplest way would be to save the images as a tar file and secure copy it to the server (I hosted on EC2 instance). You will have to allow HTTP traffic to port 80.
   ```bash
   docker save -o gossip-frontend-image.tar gossip-frontend:latest
   docker save -o gossip-backend-image.tar gossip-backend:latest
   scp -i "key.pem" *.tar user@remote.com:/some/directory
   ssh -i "key.pem" user@remote.com
   
   docker load -i /some/directory/gossip-frontend-image.tar
   docker load -i /some/directory/gossip-backend-image.tar
   ```
5. Create a docker network and run the two images
   ```bash
   docker network create nginx_network
   docker run --network="nginx_network" --name gossip-backend-container-1 -d -e DB_USERNAME='' -e DB_PASSWORD='' -e DB_HOST='' -e DB_SSLMODE='' -e SECRET_KEY='' gossip-backend:latest
   docker run --network="nginx_network" --name gossip-backend-container-2 -d -e DB_USERNAME='' -e DB_PASSWORD='' -e DB_HOST='' -e DB_SSLMODE='' -e SECRET_KEY='' gossip-backend:latest
   docker run --network="nginx_network" --name gossip-backend-container-3 -d -e DB_USERNAME='' -e DB_PASSWORD='' -e DB_HOST='' -e DB_SSLMODE='' -e SECRET_KEY='' gossip-backend:latest
   docker run --network="nginx_network" --name gossip-backend-container-4 -d -e DB_USERNAME='' -e DB_PASSWORD='' -e DB_HOST='' -e DB_SSLMODE='' -e SECRET_KEY='' gossip-backend:latest
   docker run --network="nginx_network" --name gossip-frontend-container -p 80:80 -d gossip-frontend:latest
   ```
6. Connect to the ip address of your hosting machine or localhost if it is being run locally. Replace the first 80 with whatever port you want to connect via (i.e if you put 3000:80 you connect to localhost:3000)
   
