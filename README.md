# D&D Character Creator
MERN-Stack Web Application // CIS4004 - Web-Based Information Technology @ UCF

---

## Contributors
Created by Michael John, Lucas Salinas, Brandon Harrison, Mary Bauta, and Austin Koutavas.

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- A MongoDB Atlas account (or access to the project cluster)
- Git

---

## Environment Setup

Before running the application, you must create a `.env` file inside the `server/` directory.

```

## Installation

From the root of the project, install dependencies for both the root, client, and server:

```bash

# From the root
npm install

# Then
cd client
npm install

# Then
cd ../server
npm install

## Running the Application

From the **root** of the project, run:

```bash
npm run dev
```

This single command starts both the Express/Node.js backend server and the Vite React frontend concurrently.

- **React frontend** — runs on: `http://localhost:5173`
- **Express backend (API)** — runs on: `http://localhost:8080`

> Navigate to `http://localhost:5173` in your browser to use the application.

---

## MongoDB Collections

The application connects to a MongoDB Atlas cluster using the database named **`MERNLogin`**.

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