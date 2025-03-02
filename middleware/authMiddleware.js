import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
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
