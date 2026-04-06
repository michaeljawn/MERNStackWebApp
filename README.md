# D&D Character Creator
MERN-Stack Web Application // CIS4004 - Web-Based Information Technology @ UCF

---

## Contributors
Created by Michael John, Lucas Salinas, Brandon Harrison, Mary Bauta, and Austin Koutavas.

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed

---

## Environment Setup

Before running the application, you must create a `.env` file in the root directory with the following variables:

```
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
SESSION_SECRET=your-secure-session-secret-key
```

Replace the MongoDB URI with your actual MongoDB Atlas connection string and choose a secure session secret.

## Installation

From the root of the project, install dependencies for both the root, client, and server:

```batch
install.bat
```

## Running the Application

From the **root** of the project, run:

```batch
run.bat
```

This file starts both the Express/Node.js backend server and the Vite React frontend concurrently.

- **React frontend** — runs on: `http://localhost:5173`
- **Express backend (API)** — runs on: `http://localhost:8080`

> Navigate to `http://localhost:5173` in your browser to use the application.

---

## MongoDB Collections

The application connects to a MongoDB Atlas cluster using the database named **`MERNLogin`**. The following collections are used:

- **Users** - Stores user account information and authentication data
- **Campaigns** - Stores D&D campaign data including DM info, party members, and session notes
- **Characters** - Stores D&D character sheets created by users

The following collections must exist:

| Collection | Description |
|---|---|
| `Users` | Stores registered user accounts (username, hashed password, role) |
| `Campaigns` | Stores campaigns, members, join codes, and session notes |
| `Characters` | Stores full D&D character sheets tied to each user |
| `species` | Read-only reference data for character species/races |
| `backgrounds` | Read-only reference data for character backgrounds |
| `classes` | Read-only reference data for character classes and subclasses |

> `Users`, `Campaigns`, and `Characters` are created automatically when the app first writes to them. The `species`, `backgrounds`, and `classes` collections must be pre-populated with game data before character creation will work.

---

## Project Structure

```
MERNStackWebApp/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── assets/         # SVG icons and images
│       ├── pages/          # Page components (Login, Dashboard, CharacterSheetCreator, etc.)
│       ├── styles/         # CSS stylesheets
│       ├── utils/          # Utility functions (auth, etc.)
│       ├── App.jsx
│       └── main.jsx
├── server/                 # Express backend
│   ├── server.js           # Main server entry point
│   ├── .env                # Environment variables (not committed)
│   └── package.json
├── index.html
├── package.json
└── README.md
```