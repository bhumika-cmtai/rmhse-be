import Withdrawal from "../../models/withdrawal/withdrawalModel.js";
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
      const withdrawals = await Withdrawal.find()
        .sort({ createdOn: -1 }); // Sort by latest date first
      
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