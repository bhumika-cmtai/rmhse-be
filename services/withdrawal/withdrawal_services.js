import Withdrawal from "../../models/withdrawal/withdrawalModel.js";
import User from "../../models/user/userModel.js"
import consoleManager from "../../utils/consoleManager.js";

class WithdrawalService {
  async createWithdrawal(userId, amount) {
    try {
      const withdrawalData = {
        userId,
        amount,
        createdOn: Date.now(),
        updatedOn: Date.now(),
        status: "pending"
      };

      const withdrawal = new Withdrawal(withdrawalData);
      await withdrawal.save();
      
      consoleManager.log("Withdrawal created successfully");
      return withdrawal;
    } catch (err) {
      consoleManager.error(`Error creating withdrawal: ${err.message}`);
      throw err;
    }
  }

    async getAllWithdrawals() {
    try {
      // Chain .populate() to fetch user details.
      // The second argument 'name email' selects which user fields to include.
      const withdrawals = await Withdrawal.find()
        .populate('userId', 'name') // <-- THIS IS THE NEW LINE
        .sort({ createdOn: -1 });
      
      consoleManager.log("All withdrawals retrieved successfully");
      return withdrawals;
    } catch (err) {
      consoleManager.error(`Error fetching all withdrawals: ${err.message}`);
      throw err;
    }
  }

  async updateWithdrawal(withdrawalId, updateData) {
    try {
      updateData.updatedOn = Date.now();
      
        const withdrawal = await Withdrawal.findByIdAndUpdate(
        withdrawalId, 
        updateData, 
        { new: true }
      );
      
      if (!withdrawal) {
        consoleManager.error("Withdrawal not found for update");
        return null;
      }
      console.log("-------withdrawal-------", withdrawal)

      // --- NEW LOGIC STARTS HERE ---

      // 2. Check if the status is 'approved'
      if (updateData.status === 'approved') {
        // Use findByIdAndUpdate with $inc to atomically decrement the user's income.
        // This is safer and more efficient than find, modify, and save.
        const updatedUser = await User.findByIdAndUpdate(
          withdrawal.userId,
          { $inc: { income: -withdrawal.amount } }, // Use $inc with a negative value to subtract
          { new: true } // Optional: returns the updated user document
        );

        if (updatedUser) {
          consoleManager.log(`Income successfully updated for user ${updatedUser._id}. New balance: ${updatedUser.income}`);
        } else {
          consoleManager.error(`User not found for income update: ${withdrawal.userId}`);
          // Note: Even if the user is not found, the withdrawal status is still updated.
          // You might want to add logic here to handle this case, e.g., by reverting the status.
        }
      }
      
      consoleManager.log("Withdrawal updated successfully");
      return withdrawal;
    } catch (err) {
      consoleManager.error(`Error updating withdrawal: ${err.message}`);
      throw err;
    }
  }


  async getWithdrawalsByUserId(userId) {
    try {
      const withdrawals = await Withdrawal.find({ userId })
        .sort({ createdOn: -1 }); // Sort by latest date first
      
      consoleManager.log(`Withdrawals for user ${userId} retrieved successfully`);
      return withdrawals;
    } catch (err) {
      consoleManager.error(`Error fetching withdrawals by user ID: ${err.message}`);
      throw err;
    }
  }

  async getWithdrawalById(withdrawalId) {
    try {
      const withdrawal = await Withdrawal.findById(withdrawalId);
      
      if (!withdrawal) {
        consoleManager.error("Withdrawal not found");
        return null;
      }
      
      consoleManager.log("Withdrawal retrieved successfully");
      return withdrawal;
    } catch (err) {
      consoleManager.error(`Error fetching withdrawal by ID: ${err.message}`);
      throw err;
    }
  }
}

export default new WithdrawalService(); 