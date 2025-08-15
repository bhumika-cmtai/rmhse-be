import User from "../../models/user/userModel.js"
import  jwt  from "jsonwebtoken";
// import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

class AuthService {
  async loginUser(joinId, password) {
    // --- MODIFICATION END ---
      try {
        // Find a user by their joinId
        // --- MODIFICATION START ---
        const user = await User.findOne({ joinId: joinId });
        // --- MODIFICATION END ---
  
        if (!user) {
          // --- MODIFICATION START ---
          consoleManager.error(`Login attempt failed: User not found for Join ID: ${joinId}`);
          throw new Error("Invalid credentials");
          // --- MODIFICATION END ---
        }
        
        // Compare password (assuming plain text for now as per your code)
        if (user.password !== password) {
          // --- MODIFICATION START ---
          consoleManager.error(`Login attempt failed: Invalid password for user with Join ID: ${joinId}`);
          throw new Error("Invalid credentials");
          // --- MODIFICATION END ---
        }
        consoleManager.log(`User password verified successfully for: ${user.email}`);
  
        // Create JWT payload and token (no changes needed here)
        const payload = { id: user._id, role: user.role, email: user.email, name: user.name, status: user.status };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '30d',
        });
  
        // Prepare a safe user object to return (without the password)
        const userResponse = user.toObject();
        delete userResponse.password;
  
        consoleManager.log(`User '${user.email}' logged in successfully.`);
        return { user: userResponse, token };
  
      } catch (err) {
        throw err;
      }
    }

  async signupUser({ name, email, dob, phoneNumber,fatherName ,password, status }) {
    try {
      // Check if a user with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.password !== password) {
          consoleManager.error(`Signup attempt failed: Invalid password for existing user with email: ${email}`);
          // Use a generic error message for security reasons.
          throw new Error("password is incorrect.");
        }
        if (existingUser.signupStep === 'basic') {
          // Redirect to upload-details
          const payload = { id: existingUser._id, role: existingUser.role, email: existingUser.email, name: existingUser.name, status: existingUser.status };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d',
          });

          // Prepare a safe user object to return
          const userResponse = existingUser.toObject();
          delete userResponse.password;

          consoleManager.log(`User '${email}' found and redirect to upload details successfully.`);
        // Return both the user object and the token
        return { user: userResponse, token, redirect: '/upload-details' };
        } else if (existingUser.signupStep === 'details') {
          const payload = { id: existingUser._id, role: existingUser.role, email: existingUser.email, name: existingUser.name, status: existingUser.status };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d',
          });

          // Prepare a safe user object to return
          const userResponse = existingUser.toObject();
          delete userResponse.password;

          consoleManager.log(`User '${email}' found and redirect to payment successfully.`);
          // Redirect to payment
          return { user: userResponse, token, redirect: '/payment' };
        }
        else{
            consoleManager.error(
              `Signup attempt failed: User already exists with email: ${email}`
            );
            throw new Error("User already exists");
        }
      }
      

      // Hash password
      consoleManager.log(`Creating new user with email: ${email}`);
      const date = Date.now()
      // Create a new user instance
      const newUser = new User({
        name,
        email,
        dob,
        phoneNumber,
        fatherName,
        password, // Storing plain text password - NOT FOR PRODUCTION
        role: "MEM", // Default role for new signups,
        status,
        createdOn: date,
        createdOn: date,
        // signupStep: "basic"

      });
      // Save the new user to the database
      await newUser.save();

      // Implement referral income distribution system
      // await this.distributeReferralIncome(refferedBy);

      // --- MODIFICATION START ---
      // Create JWT payload and token for the new user
      const payload = { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name, status: newUser.status };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      // Prepare a safe user object to return
      const userResponse = newUser.toObject();
      delete userResponse.password;

      consoleManager.log(`User '${email}' created successfully.`);
      // Return both the user object and the token
      return { user: userResponse, token };
      // --- MODIFICATION END ---
      
    } catch (err) {
      // Re-throw the error to be handled by the route
      throw err;
    }
  }

  
}


export default new AuthService();