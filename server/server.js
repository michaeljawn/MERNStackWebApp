// MODULES
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 8080;

// MIDDLEWARE SETUP
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db = null;

// HOMEPAGE ROUTE
app.get("/", (req, res) => {
  res.send("Server is running");
});

// TEST ROUTE
app.get("/test", (req, res) => {
  res.send("Test route working");
});

// ADD A USER
app.post("/users", async (req, res) => {
  if (!db) {
    return res.status(500).send("Database not connected");
  }

  try {
    const { username, password } = req.body;
    const collection = db.collection("Users");

    const existingUser = await collection.findOne({ username: username });

    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    await collection.insertOne({ username, password });

    res.send("User added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding user");
  }
});

// GET ALL USERS
app.get("/allusers", async (req, res) => {
  if (!db) {
    return res.status(500).send("Database not connected");
  }

  try {
    const collection = db.collection("Users");
    const result = await collection.find().toArray();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting users");
  }
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  if (!db) {
    return res.status(500).send("Database not connected");
  }

  try {
    const { username, password } = req.body;
    const collection = db.collection("Users");

    const user = await collection.findOne({
      username: username,
      password: password,
    });

    if (user) {
      res.send("Login successful");
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Login error");
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// CONNECT TO MONGODB
async function connectDB() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db("MERNLogin");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("MongoDB connection failed");
    console.log(error);
  }
}

connectDB();