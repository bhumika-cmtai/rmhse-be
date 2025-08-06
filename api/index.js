// A temporary index.js for debugging

import express from "express";
import cors from "cors";

const app = express();

// Use basic CORS
app.use(cors());

// A simple test route
app.get("/v1/test", (req, res) => {
  console.log("Test route hit successfully!");
  res.status(200).json({ message: "Hello from the Vercel backend!" });
});

// A catch-all for your login route to see if it's reachable at all
app.use("/v1/auth/login", (req, res) => {
  console.log("Login route was reached!");
  res.status(200).json({ message: "Login route is alive!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;