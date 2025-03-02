import express from "express";
import { readDB, writeDB } from "../utils/dbUtils.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get All Users (Protected)
router.get("/", verifyToken, (req, res) => {
  const db = readDB();
  if (!db.employees) {
    return res.status(500).json({ message: "Users data not found" });
  }
  res.json(db.employees);
});
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const user = db.employees.find(user => user.id == id);
  if (user === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json( user);
});


// Delete User (Protected)
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const userIndex = db.employees.findIndex(user => user.id == id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  db.employees.splice(userIndex, 1);
  writeDB(db);

  res.json({ message: "User deleted successfully", id });
});

router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const updates=req.body
  const db = readDB();
  
  const userIndex = db.employees.findIndex(user => user.id == id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  db.employees[userIndex] = { ...db.employees[userIndex], ...updates };
  writeDB(db);

  res.json({ message: "User updated successfully", user: db.employees[userIndex] });
});

export default router;
