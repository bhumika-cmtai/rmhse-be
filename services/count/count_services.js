import User from "../../models/user/userModel.js";
import Withdrawal from "../../models/withdrawal/withdrawalModel.js";
import Extend from "../../models/extend/extendModel.js";
import consoleManager from "../../utils/consoleManager.js";

class CountService {
  async fetchTotalUsers() {
    try {
      const count = await User.countDocuments();
      consoleManager.log(`Total users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalBM() {
    try {
      const count = await User.countDocuments({ role: "BM" });
      consoleManager.log(`Total BM users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total BM users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalDIV() {
    try {
      const count = await User.countDocuments({ role: "DIV" });
      consoleManager.log(`Total DIV users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total DIV users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalDIST() {
    try {
      const count = await User.countDocuments({ role: "DIST" });
      consoleManager.log(`Total DIST users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total DIST users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalSTAT() {
    try {
      const count = await User.countDocuments({ role: "STAT" });
      consoleManager.log(`Total STAT users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total STAT users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalRegularUser() {
    try {
      const count = await User.countDocuments({ role: "user" });
      consoleManager.log(`Total regular users count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total regular users: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalIncome() {
    try {
      const result = await User.aggregate([
        { $group: { _id: null, totalIncome: { $sum: "$income" } } }
      ]);
      const totalIncome = result.length > 0 ? result[0].totalIncome : 0;
      consoleManager.log(`Total income of all users: ${totalIncome}`);
      return totalIncome;
    } catch (err) {
      consoleManager.error(`Error calculating total income: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalWithdrawalRequests() {
    try {
      const count = await Withdrawal.countDocuments();
      consoleManager.log(`Total withdrawal requests count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total withdrawal requests: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalExtendRequest() {
    try {
      const count = await Extend.countDocuments();
      consoleManager.log(`Total extend requests count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error fetching total extend requests: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalIncomeByUserId(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error(`User ${userId} not found`);
        return 0;
      }
      const totalIncome = user.income || 0;
      consoleManager.log(`Total income for user ${userId}: ${totalIncome}`);
      return totalIncome;
    } catch (err) {
      consoleManager.error(`Error fetching total income for user ${userId}: ${err.message}`);
      throw err;
    }
  }

  async fetchTotalLimitsByUserId(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error(`User ${userId} not found`);
        return 0;
      }
      const totalLimit = user.limit || 25;
      consoleManager.log(`Total limit for user ${userId}: ${totalLimit}`);
      return totalLimit;
    } catch (err) {
      consoleManager.error(`Error fetching total limit for user ${userId}: ${err.message}`);
      throw err;
    }
  }
}

export default new CountService();