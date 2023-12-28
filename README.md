# Gossip

Gossip is my submission for CVWO winter assignment AY23/24. It is hosted on AWS available at http://izngossip.ddns.net

## Getting Started

```
git clone https://github.com/IzN432/gossip.git

cd gossip
```

### Starting front end

```
cd gossip-frontend

npm install

npm start
```

### Starting back end

```
cd gossip

go download

go run main.go -mode dev
```

The web app will be available at localhost:3000

## Features

### Authentication

- **/signin:** Sign in to an existing account with an optional password.
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
  
## Production

A guide to simulate production environment

```
cd gossip

cd gossip-frontend

npm run build

cd ..

go build -o main.exe

.\main.exe
```

The web app will be available at localhost:8080
