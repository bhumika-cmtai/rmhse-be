import express from "express";
import AuthService from "../../services/auth/auth_services.js"
import consoleManager from "../../utils/consoleManager.js";
import ResponseManager from "../../utils/responseManager.js";
// import { encrypt } from "../../utils/encryptionUtils.js";

const router = express.Router();

// User login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return ResponseManager.handleBadRequestError(
        res,
        "Email and password are required"
      );
    }

    // console.log(email)
    // console.log(password)
    // Login the user and generate JWT token
    const {user,token} = await AuthService.loginUser(email, password);

    // Encrypt the JWT token
    // const encryptedToken = encrypt(token);

    // Send success response with the encrypted token
    ResponseManager.sendSuccess(
      res,
      {user, token },
      200,
      "Login successful"
    );
  } catch (err) {
    if (err.message === "Invalid credentials") {
      // console.log(err)
      return ResponseManager.sendError(
        res,
        401, 
        "AUTHENTICATION_FAILED",
        "Invalid email or password. Please try again."
      );
    }

    // Handle other unexpected errors
    consoleManager.error(`Unhandled error in login route: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "An internal server error occurred during login."
    );

  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, dob, phoneNumber, password, status } = req.body;

    // Validate request body
    if (!name || !email || !dob || !phoneNumber || !password) {
      return ResponseManager.handleBadRequestError(
        res,
        "All fields are required"
      );
    }

    // Create the new user
    const {user, token} = await AuthService.signupUser({
      name,
      email,
      dob,
      phoneNumber,
      password,
      status
    });

    // Send success response
    ResponseManager.sendSuccess(
      res,
      { user, token },
      201,
      "User created successfully"
    );
  } catch (err) {
    if (err.message === "User already exists") {
      return ResponseManager.sendError(
        res,
        409,
        "CONFLICT",
        "A user with this email already exists."
      );
    }

    // Handle other unexpected errors
    // console.log(err)
    consoleManager.error(`Unhandled error in signup route: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "An internal server error occurred during signup."
    );
  }
}
)

router.post("/signup1",async (req, res)  => {
  let { fullName, email, mobile, password, confirmPassword, role, termsAccepted } = req.body;
  
  if (role) role = role.toLowerCase().trim();
  if (email) email = email.toLowerCase().trim();

  if (!fullName || !email || !mobile || !password || !confirmPassword || !role || !termsAccepted) {
    return res.status(400).json({
      success: false,
      message: "Please provide all fields and accept terms",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });

    if (userExists && userExists.isVerified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile already exists.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    let user;
    if (userExists && !userExists.isVerified) {
      user = userExists;
      user.fullName = fullName;
      user.email = email;
      user.mobile = mobile;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.role = role;
      user.termsAccepted = termsAccepted;
    } else {
      user = new User({
        fullName,
        email,
        mobile,
        password,
        role,
        termsAccepted,
        otp,
        otpExpires,
      });
    }

    await user.save();
    
    const profileData = { name: fullName, phone: mobile };
    if (role === "employer") {
      await EmployerProfile.findOneAndUpdate({ user: user._id }, profileData, { upsert: true, new: true });
    } else if (role === "college") {
      await CollegeProfile.findOneAndUpdate({ user: user._id }, profileData, { upsert: true, new: true });
    } else if (role === "admin") {
      await AdminProfile.findOneAndUpdate({ user: user._id }, profileData, { upsert: true, new: true });
    }
    
    const message = `Welcome! Your OTP is: ${otp}. It is valid for 10 minutes.`;
    await sendEmail({
      email: user.email,
      subject: "Your Email Verification Code",
      message,
    });

    const tempToken = generateTempToken(user._id);

    return res.status(200).json({
      success: true,
      message: `An OTP has been sent to ${user.email}. Please verify.`,
      tempToken: tempToken,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during signup.",
    });
  }
})



export default router