import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "./db.json";

// Function to read `db.json`
const readDB = () => {
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

// Function to write to `db.json`
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const db = readDB();
  // Check if user exists
  if (db.users.find((user) => user.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, email, password: hashedPassword };
  db.users.push(newUser);
  writeDB(db);

  // Generate JWT
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(201).json({ message: "User registered successfully", token });
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const db = readDB();

  const user = db.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Token Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Access Denied: No token provided" });
  }
  const actualToken = token.split(" ")[1]; // Remove 'Bearer' prefix
  jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

// Protected Route Example
app.get("/employees", verifyToken, (req, res) => {
  const db = readDB()
  if (!db.users) {
    return res.status(500).json({ message: "Users data not found" });
  }
  // Check if user exists
 res.json(db.users);
  
});



app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const db = readDB();

  const user = db.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});



// Protected Route Example



// Start Server
app.listen(5001, () => console.log("Server running on port 5001"));
app.delete("/employees/:id", verifyToken, (req, res) => {
  const {id} =req.params;
  const db = readDB()
  // Find user
  const userIndex = db.users.findIndex(user => user.id == id);
  // Remove user from the array
  db.users.splice(userIndex, 1);
  writeDB(db); // Save updated user list

  res.json({ message: "User deleted successfully", id });
  
});
