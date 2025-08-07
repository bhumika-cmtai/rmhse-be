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

async signupUser({ name, email, dob, phoneNumber, password, memberId, refferedBy }) {
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
        role: "user", // Default role for new signups,
        refferedBy,
        memberId,
        createdOn: date,
        updatedOn:date

      });
      // Save the new user to the database
      await newUser.save();

      // Implement referral income distribution system
      await this.distributeReferralIncome(refferedBy);

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

  // --- MODIFICATION START ---
  // Refactored to pay each user in the referral chain based on their role,
  // respecting a total budget for the chain.
  async distributeReferralIncome(refferedBy) {
    try {
      if (!refferedBy) {
        consoleManager.log("No referral provided, skipping income distribution.");
        return;
      }

      // The total budget for the referral chain (excluding BM and Admin).
      const TOTAL_CHAIN_BUDGET = 350; 
      const BM_PAYOUT = 10;
      
      const referralPayouts = {
        "DIV": 70,
        "DIST": 40,
        "STAT": 20,
      };

      let chainAmountRemaining = TOTAL_CHAIN_BUDGET;
      let currentReferrerId = refferedBy;

      // --- 1. Pay out the referral chain ---
      consoleManager.log(`Starting referral chain payout with a budget of ${chainAmountRemaining}.`);
      while (currentReferrerId && currentReferrerId !== "admin123" && chainAmountRemaining > 0) {
        const referrer = await User.findOne({ memberId: currentReferrerId });

        if (!referrer) {
          consoleManager.warn(`Referrer with memberId '${currentReferrerId}' not found. Stopping chain traverse.`);
          break;
        }

        const payout = referralPayouts[referrer.role];
        
        if (payout) {
          // Pay the user either their full payout or whatever is left in the budget.
          const amountToPay = Math.min(payout, chainAmountRemaining);

          await User.findByIdAndUpdate(referrer._id, { $inc: { income: amountToPay } });
          chainAmountRemaining -= amountToPay;

          consoleManager.log(
            `Paid ${amountToPay} to ${referrer.role} user: ${referrer.email}. ` +
            `Budget remaining: ${chainAmountRemaining}`
          );
        }
        
        currentReferrerId = referrer.refferedBy;
      }
      
      // --- 2. Pay out to BM users (this is a separate calculation) ---
      let adminAmount = TOTAL_CHAIN_BUDGET - (TOTAL_CHAIN_BUDGET - chainAmountRemaining);

      const bmUsers = await User.find({ role: "BM" });
      if (bmUsers.length > 0) {
        for (const bmUser of bmUsers) {
          await User.findByIdAndUpdate(bmUser._id, { $inc: { income: BM_PAYOUT } });
        }
        adminAmount -= (BM_PAYOUT * bmUsers.length);
        consoleManager.log(`Paid ${BM_PAYOUT} to each of the ${bmUsers.length} BM users.`);
      }

      // --- 3. Pay any final remaining amount to the Admin ---
      if (adminAmount > 0) {
        const adminUser = await User.findOne({ role: "admin" });
        if (adminUser) {
          await User.findByIdAndUpdate(adminUser._id, { $inc: { income: adminAmount } });
          consoleManager.log(`Paid remaining ${adminAmount} to admin user: ${adminUser.email}`);
        } else {
            consoleManager.warn(`Admin user not found to pay the final remaining amount of ${adminAmount}.`);
        }
      }

      consoleManager.log("Referral income distribution completed.");
    } catch (error) {
      consoleManager.error(`Error in referral income distribution: ${error.message}`);
      throw error;
    }
  }
  // --- MODIFICATION END ---
}


export default new AuthService();