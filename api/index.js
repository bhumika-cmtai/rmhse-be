import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "../database/db.js"
import consoleManager from "../utils/consoleManager.js"
import Razorpay from "razorpay";
import User from "../models/user/userModel.js";
import crypto from 'crypto';


dotenv.config();
const app = express();

// Connect to MongoDB (cached connection)
connectDB().catch((error) => {
  consoleManager.error(`Database connection failed: ${error.message}`);
  process.exit(1);
});

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3001', 'https://www.rmhse.org/', "https://www.rmhse.org","https://rmhse.vercel.app/"];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 600 // Cache preflight request for 10 minutes
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors(corsOptions));

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
import videoRoute from "../routes/video/videoRoutes.js"
import notificationRoute from "../routes/notification/notificationRoutes.js"
import contactRoute from "../routes/contact/contact_routes.js"
// import countRoute from "../routes/count/count_routes.js"

app.use("/v1/auth", authRoute);
app.use("/v1/users", userRoute);
app.use("/v1/withdrawals", withdrawalRoute);
app.use("/v1/extends", extendRoute);
app.use("/v1/count", countRoute);
app.use("/v1/video", videoRoute);
app.use("/v1/notifications", notificationRoute);
app.use("/v1/contacts", contactRoute)
app.use("/v1/counts", countRoute)


// Error handling middleware
app.use((err, req, res, next) => {
  consoleManager.error(`Server error: ${err.stack}`);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

// Start the server

// ROUTE: Create a Razorpay Order
app.post('/v1/payment/order', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
  }

  const payment_capture = 1;
  const amount = 350;
  const currency = 'INR';

  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

app.post('/v1/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    // console.log(req.body)

    if (!userId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details for verification.' });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ status: 'failure', message: 'Payment verification failed. Invalid signature.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.razorpay_order_id = razorpay_order_id;
    user.razorpay_payment_id = razorpay_payment_id;
    user.razorpay_signature = razorpay_signature;
    user.paymentStatus = 'completed';
    console.log("this is credentail",razorpay_order_id, razorpay_payment_id, razorpay_signature, user.paymentStatus);

    await user.save();

    res.json({ status: 'success', message: 'Payment verified and status updated successfully.' });

  } catch (error) {
    console.error("Error in payment verification:", error);
    res.status(500).json({ status: 'failure', message: 'Internal server error during payment verification.' });
  }
});


app.get('/v1/razorpay-key', (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

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
