import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "../database/db.js"
import consoleManager from "../utils/consoleManager.js"
dotenv.config();
const app = express();

// Connect to MongoDB (cached connection)
connectDB().catch((error) => {
  consoleManager.error(`Database connection failed: ${error.message}`);
  process.exit(1);
});

// CORS Configuration for credentialed requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all origins for development
      callback(null, true);
    },
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow credentials (cookies, HTTP authentication)
  })
);

// Middleware
app.use(express.json());
// app.use(cookieParser());

// Import routes
// const profileRoute = require("../routes/auth/profile");
import userRoute from "../routes/user/user_routes.js"
// import contactRoute from "../routes/contact/contact_routes.js"

import authRoute from "../routes/auth/auth_routes.js"
import countRoute from "../routes/count/count_routes.js"
import withdrawalRoute from "../routes/withdrawal/withdrawal_routes.js"
import extendRoute from "../routes/extend/extend_routes.js"


app.use("/v1/auth", authRoute);
app.use("/v1/users", userRoute);
app.use("/v1/withdrawals", withdrawalRoute);
app.use("/v1/extends", extendRoute);
app.use("/v1/count", countRoute);
// app.use("/v1/contacts", contactRoute);


// Error handling middleware
app.use((err, req, res, next) => {
  consoleManager.error(`Server error: ${err.stack}`);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

// Start the server

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  //consoleManger changed to console.log for now
  try{

    console.log(`Server is running on port ${PORT}`);
  }
  catch(error){
    console.log(error)
  }
});

export default app;
