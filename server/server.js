// MODULES
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
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
      role: "user",
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
        role: user.role === undefined ? "user" : user.role, // Fixes old logins
      };

      res.json({
        success: true,
        message: "Login successful",
        user: req.session.user,
      });

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
      isAdmin: req.session.user.role === "admin",
      user: req.session.user,
    });
  }
  else {
    res.status(401).json({
      loggedIn: false,
      isAdmin: false,
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

// GET ALL CAMPAIGNS FOR LOGGED-IN USER
app.get("/campaigns", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const collection = db.collection("Campaigns");
    const campaigns = await collection
      .find({ userId: req.session.user.id.toString() })
      .toArray();
    res.json(campaigns);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching campaigns");
  }
});


// GET A SINGLE CAMPAIGN BY ID
app.get("/campaigns/:id", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const collection = db.collection("Campaigns");
    const campaign = await collection.findOne({
      _id: new ObjectId(req.params.id),
      userId: req.session.user.id.toString(),
    });

    if (!campaign) return res.status(404).send("Campaign not found");
    res.json(campaign);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching campaign");
  }
});


// CREATE A NEW CAMPAIGN
app.post("/campaigns", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const { name, dmName, description, setting } = req.body;

    if (!name) return res.status(400).send("Campaign name is required");

    const collection = db.collection("Campaigns");
    const result = await collection.insertOne({
      userId: req.session.user.id.toString(),
      name,
      dmName: dmName || "",
      description: description || "",
      setting: setting || "",
      sessionNotes: [],
      partyMembers: [],
      createdAt: new Date(),
    });

    res.json({ message: "Campaign created", id: result.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating campaign");
  }
});


// UPDATE A CAMPAIGN
app.put("/campaigns/:id", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const { name, dmName, description, setting, sessionNotes, partyMembers } = req.body;
    const collection = db.collection("Campaigns");

    const result = await collection.updateOne(
      {
        _id: new ObjectId(req.params.id),
        userId: req.session.user.id.toString(),
      },
      {
        $set: {
          ...(name && { name }),
          ...(dmName !== undefined && { dmName }),
          ...(description !== undefined && { description }),
          ...(setting !== undefined && { setting }),
          ...(sessionNotes !== undefined && { sessionNotes }),
          ...(partyMembers !== undefined && { partyMembers }),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) return res.status(404).send("Campaign not found");
    res.json({ message: "Campaign updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating campaign");
  }
});


// DELETE A CAMPAIGN
app.delete("/campaigns/:id", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const collection = db.collection("Campaigns");
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.session.user.id.toString(),
    });

    if (result.deletedCount === 0) return res.status(404).send("Campaign not found");
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting campaign");
  }
});


// ADD A SESSION NOTE TO A CAMPAIGN
app.post("/campaigns/:id/notes", async (req, res) => {
  if (!db) return res.status(500).send("Database not connected");
  if (!req.session.user) return res.status(401).send("Not logged in");

  try {
    const { note } = req.body;
    if (!note) return res.status(400).send("Note is required");

    const collection = db.collection("Campaigns");
    const result = await collection.updateOne(
      {
        _id: new ObjectId(req.params.id),
        userId: req.session.user.id.toString(),
      },
      {
        $push: {
          sessionNotes: {
            id: new ObjectId().toString(),
            text: note,
            createdAt: new Date(),
          },
        },
      }
    );

    if (result.matchedCount === 0) return res.status(404).send("Campaign not found");
    res.json({ message: "Note added" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding note");
  }
});

// ADMIN MIDDLEWARE — checks if the logged-in user has role "admin"
function requireAdmin(req, res, next) {
    if (!req.session.user) return res.status(401).send("Not logged in");
    if (req.session.user.role !== "admin") return res.status(403).send("Access denied");
    next();
}

// GET ALL USERS (admin only)
app.get("/admin/users", requireAdmin, async (req, res) => {
    if (!db) return res.status(500).send("Database not connected");
    try {
        const collection = db.collection("Users");
        const users = await collection
            .find({}, { projection: { password: 0 } })
            .toArray();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching users");
    }
});

// GET ALL CAMPAIGNS ACROSS ALL USERS (admin only)
app.get("/admin/campaigns", requireAdmin, async (req, res) => {
    if (!db) return res.status(500).send("Database not connected");
    try {
        const campaignsCollection = db.collection("Campaigns");
        const usersCollection = db.collection("Users");

        const campaigns = await campaignsCollection.find({}).toArray();
        const users = await usersCollection
            .find({}, { projection: { _id: 1, username: 1 } })
            .toArray();

        // Build a map of userId -> username
        const userMap = {};
        users.forEach((u) => { userMap[u._id.toString()] = u.username; });

        // Attach ownerUsername to each campaign
        const enriched = campaigns.map((c) => ({
            ...c,
            ownerUsername: userMap[c.userId] || "Unknown",
        }));

        res.json(enriched);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching campaigns");
    }
});

// UPDATE ANY CAMPAIGN (admin only)
app.put("/admin/campaigns/:id", requireAdmin, async (req, res) => {
    if (!db) return res.status(500).send("Database not connected");
    try {
        const { name, dmName, description, setting } = req.body;
        const collection = db.collection("Campaigns");

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    ...(name && { name }),
                    ...(dmName !== undefined && { dmName }),
                    ...(description !== undefined && { description }),
                    ...(setting !== undefined && { setting }),
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) return res.status(404).send("Campaign not found");
        res.json({ message: "Campaign updated" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating campaign");
    }
});

// DELETE ANY CAMPAIGN (admin only)
app.delete("/admin/campaigns/:id", requireAdmin, async (req, res) => {
    if (!db) return res.status(500).send("Database not connected");
    try {
        const collection = db.collection("Campaigns");
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) return res.status(404).send("Campaign not found");
        res.json({ message: "Campaign deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting campaign");
    }
});

// PROMOTE A USER TO ADMIN (admin only)
app.put("/admin/users/:id/promote", requireAdmin, async (req, res) => {
    if (!db) return res.status(500).send("Database not connected");
    try {
        const collection = db.collection("Users");
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { role: "admin" } }
        );
        res.json({ message: "User promoted to admin" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error promoting user");
    }
});

connectDB();