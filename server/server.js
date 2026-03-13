// MODULES
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = 8080;

// MIDDLEWARE SETUP
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);


let db = null;

// HOMEPAGE ROUTE
app.get("/", (req, res) => {
  res.send("Server is running");
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.insertOne({
      username: username,
      password: hashedPassword,
    });

    res.send("User added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding user");
  }
});


// GET ALL USERS (DEBUG / TEST ROUTE)
app.get("/allusers", async (req, res) => {
  if (!db) {
    return res.status(500).send("Database not connected");
  }

  try {
    const collection = db.collection("Users");

    const result = await collection
      .find({}, { projection: { password: 0 } }) // hide password
      .toArray();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting users");
  }
});







// LOGIN FUNCTIONS


// LOGIN ROUTE
app.post("/login", async (req, res) => {
  if (!db) {
    return res.status(500).send("Database not connected");
  }

  try {
    const { username, password } = req.body;
    const collection = db.collection("Users");

    const user = await collection.findOne({ username: username });

    if (user && (await bcrypt.compare(password, user.password))) {

      // STORE USER SESSION
      req.session.user = {
        username: user.username,
        id: user._id,
      };

      res.send("Login successful");

    } else {
      res.status(401).send("Invalid username or password");
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Login error");
  }
});


// CHECK IF USER IS LOGGED IN
app.get("/check-login", (req, res) => {

  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user,
    });
  }
  else {
    res.status(401).json({
      loggedIn: false,
    });
  }

});


// LOGOUT USER
app.post("/logout", (req, res) => {

  req.session.destroy((error) => {

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logged out",
    });

  });

});












// BACKEND LISTENER AND DATABASE CONNECTION

async function connectDB() {

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {

    await client.connect();

    db = client.db("MERNLogin");

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  }
  catch (error) {

    console.log("MongoDB connection failed");
    console.log(error);

  }

}

connectDB();