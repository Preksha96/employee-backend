import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDB, writeDB } from '../utils/dbUtils.js';

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const db = readDB();
  if (db.users.find((user) => user.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Entered password:", password);

  const newUser = { id: Date.now(), username, email, password: hashedPassword };
  db.users.push(newUser);
  writeDB(db);
  
  
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.status(201).json({ message: "User registered successfully", token });
});

// Login Route
router.post("/login", async (req, res) => {
  console.log(req.body,"sssss")
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const db = readDB();
  const user = db.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });
console.log(user.password,"ssmksmksmksmksmksmkm")
  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch,"smksmkmskm")
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

export default router;
