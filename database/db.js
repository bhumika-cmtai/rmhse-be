import mongoose from "mongoose";
import consoleManager from "../utils/consoleManager.js"
import dotenv from "dotenv"
// const consoleManager = require("../utils/consoleManager");

const connectDB = async () => {
  try {
    console.log("db connection")
    const connected = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "rmhse",
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        
      }
    );
    // console.log("MongoDB connected successfully")
    consoleManager.log("MongoDB connected successfully");
  } catch (err) {
    // console.log(err)
    consoleManager.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;