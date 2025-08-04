import express from "express";
import LoginService from "../../services/auth/auth_services.js"
import AppLinkService from "../../services/applink/applink_service.js"
import consoleManager from "../../utils/consoleManager.js";
import ResponseManager from "../../utils/responseManager.js";
// import { encrypt } from "../../utils/encryptionUtils.js";

const router = express.Router();

router.post("/signup",async (req, res)  => {
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
