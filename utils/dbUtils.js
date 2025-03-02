import fs from "fs";

const DB_FILE = "./db.json";

// Read database
export const readDB = () => {
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

// Write to database
export const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};
