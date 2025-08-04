import User from "../../models/user/userModel.js"
import  jwt  from "jsonwebtoken";
// import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

class AuthService {
  async loginUser(email, password) {
    try {
      // Find a user who is NOT an admin by their email
      const user = await User.findOne({ email: email});
      // console.log(user)
      if (!user) {
        consoleManager.error(`Login attempt failed: Non-admin user not found for email: ${email}`);
        throw new Error("Invalid credentials");
      }
      //hash with bcrypt
      if (user.password !== password) {
        consoleManager.error(`Login attempt failed: Invalid password for user: ${email}`);
        throw new Error("Invalid credentials");
      }
      consoleManager.log(`User password verified successfully for: ${email}`);

    // Step 3: COMMON SUCCESS LOGIC (runs if no error was thrown above)
    // If we reach this point, authentication was successful for either admin or non-admin.

    // Create JWT payload and token
    const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Prepare a safe user object to return (without the password)
    const userResponse = user.toObject();
    delete userResponse.password;

    consoleManager.log(`User '${user.email}' logged in successfully.`);
    return { user: userResponse, token };

  } catch (err) {
    // Re-throw the error to be handled by the route
    throw err;
  }
}

async signupUser({ name, email, dob, phoneNumber, password }) {
    try {
      // Check if a user with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        consoleManager.error(
          `Signup attempt failed: User already exists with email: ${email}`
        );
        throw new Error("User already exists");
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
        password, // Storing plain text password - NOT FOR PRODUCTION
        role: "user", // Default role for new signups
        createdOn: date,
        updatedOn:date

      });
      // Save the new user to the database
      await newUser.save();

      // Prepare a safe user object to return
      const userResponse = newUser.toObject();
      delete userResponse.password;

      consoleManager.log(`User '${email}' created successfully.`);
      return userResponse;
    } catch (err) {
      // Re-throw the error to be handled by the route
      throw err;
    }
  }
  
}

export default new AuthService();