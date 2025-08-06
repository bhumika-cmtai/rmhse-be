import User from "../../models/user/userModel.js"
import consoleManager from "../../utils/consoleManager.js";
// const User = require("../../models/user/userModel");
// const consoleManager = require("../../utils/consoleManager");
import { uploadToCloudinary } from '../../config/cloudinary.js';
import fs from 'fs';

class UserService {
  async createUser(data) {
   try {
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 409; 
        throw error;
      }
      data.createdOn =  Date.now();
      data.updatedOn =  Date.now();

      const user = new User(data);
      await user.save();
      consoleManager.log("User created successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error creating user: ${err.message}`);
      throw err;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error("User not found");
        return null;
      }
      if (user) {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
      }
      return null;
    } catch (err) {
      consoleManager.error(`Error fetching user: ${err.message}`);
      throw err;
    }
  }

  async updateUser(userId, data) {
    try {
      data.updatedOn = Date.now();
      const user = await User.findByIdAndUpdate(userId, data, { new: true });
      console.log(user)
      if (!user) {
        consoleManager.error("User not found for update");
        return null;
      }
      consoleManager.log("User updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user: ${err.message}`);
      throw err;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        consoleManager.error("User not found for deletion");
        return null;
      }
      consoleManager.log("User deleted successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error deleting user: ${err.message}`);
      throw err;
    }
  }

  async deleteManyUsers(userIds) {
    try {
      const result = await User.deleteMany({ _id: { $in: userIds } });
      consoleManager.log(`Deleted ${result.deletedCount} users.`);
      return result;
    } catch (err) { 
      consoleManager.error(`Error deleting users: ${err.message}`);
      throw err;
    }
  } 

  async getAllUsers(searchQuery = '', status, role, page = 1, limit = 15, month, year) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      console.log(searchQuery)
      // Base pipeline
      const pipeline = [];

      // Add a field that converts the `createdOn` STRING to a real DATE
      pipeline.push({
        $addFields: {
          createdOnDate: { $toDate: { $toLong: "$createdOn" } }
        }
      });
      
      // Add the latest roleId field for search
      pipeline.push({
        $addFields: {
          latestRoleId: { $arrayElemAt: ["$roleId", -1] }
        }
      });

      // Build the match stage for all filters
      const matchStage = {};
      
      // Add status filter
      if (status) {
        matchStage.status = status;
      }
      
      // MODIFIED: Add role filter for the dropdown
      if (role) {
        matchStage.role = role;
      }

      // Add date filter if month and year are provided
      if (month && year) {
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        matchStage.createdOnDate = {
          $gte: startOfMonth,
          $lte: endOfMonth
        };
      }
      
      // MODIFIED: Add search query filter to search name, role, phoneNumber, and roleId
      if (searchQuery) {
        matchStage.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { phoneNumber: { $regex: searchQuery, $options: 'i' } },
          { role: { $regex: searchQuery, $options: 'i' } },
          { "roleId": { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
          { latestRoleId: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Add the match stage if there are any filters
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Sort by the createdOnDate field for correct ordering
      pipeline.push({ $sort: { createdOnDate: -1 } });

      // Create a separate pipeline for counting
      const countPipeline = [...pipeline]; // Copy the pipeline
      countPipeline.push({ $count: 'totalUsers' });

      // Add pagination to the main pipeline
      const APPLY_PAGINATION_THRESHOLD = 1000;
      if (limitNum < APPLY_PAGINATION_THRESHOLD) {
        const skip = (pageNum - 1) * limitNum;
        pipeline.push(
          { $skip: skip },
          { $limit: limitNum }
        );
      }

      const [users, totalCountResult] = await Promise.all([
        User.aggregate(pipeline),
        User.aggregate(countPipeline)
      ]);

      const totalUsers = totalCountResult.length > 0 ? totalCountResult[0].totalUsers : 0;
      const totalPages = Math.ceil(totalUsers / limitNum);

      return {
        users,
        totalPages,
        currentPage: pageNum,
        totalUsers
      };

    } catch (err) {
      console.error(`Error fetching users: ${err.message}`);
      throw err;
    }
  }
  

  async getNumberOfUsers() {
    try {
      const count = await User.countDocuments();
      consoleManager.log(`Number of users: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting users: ${err.message}`);
      throw err;
    }
  }
  async getLeaderCode(leaderCode){
    try{
      const user = await User.findOne(
        { leaderCode: leaderCode },
        'name leaderCode -_id' 
      );
     if (!user) {
        consoleManager.error("Leader Code not found");
        return null;
      }
      return user;
    } catch (err) {
      consoleManager.error(`Error fetching Leader Code from user: ${err.message}`);
      throw err;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const updateFields = {
        name: profileData.name,
        whatsappNumber: profileData.whatsappNumber,
        city: profileData.city,
        bio: profileData.bio,
        updatedOn: Date.now(),
        password: profileData.password
      };

      // Remove any fields that were not provided in the request body
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      if (!user) {
        consoleManager.error("User not found for profile update");
        return null;
      }
      
      consoleManager.log("User profile updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user profile: ${err.message}`);
      throw err;
    }
  }

  // =================================================================
  // NEW FUNCTION FOR UPDATING BANK DETAILS
  // =================================================================
  async updateBankDetails(userId, bankData) {
    try {
      const updateFields = {
        account_number: bankData.account_number,
        Ifsc: bankData.Ifsc,
        upi_id: bankData.upi_id,
        updatedOn: Date.now()
      };

      // Remove any fields that were not provided in the request body
      Object.keys(updateFields).forEach(key => {
         if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
      if (!user) {
        consoleManager.error("User not found for bank details update");
        return null;
      }
      
      consoleManager.log("User bank details updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating bank details: ${err.message}`);
      throw err;
    }
  }

  async updateDocument(userId, files) {
    try {
      if (!files || Object.keys(files).length === 0) {
        const error = new Error("No files were provided for upload.");
        error.statusCode = 400;
        throw error;
      }
      
      const updateFields = {};

      // Process each potential file upload
      if (files.pancard) {
        const result = await uploadToCloudinary(files.pancard[0].path, 'user_documents');
        updateFields.pancard = result.secure_url;
        fs.unlinkSync(files.pancard[0].path); // Clean up the temporary file
      }
  
      if (files.adharFront) {
        const result = await uploadToCloudinary(files.adharFront[0].path, 'user_documents');
        updateFields.adharFront = result.secure_url;
        fs.unlinkSync(files.adharFront[0].path); // Clean up
      }
  
      if (files.adharBack) {
        const result = await uploadToCloudinary(files.adharBack[0].path, 'user_documents');
        updateFields.adharBack = result.secure_url;
        fs.unlinkSync(files.adharBack[0].path); // Clean up
      }

      // Only update if there are new URLs
      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedOn = Date.now();
        
        const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
        
        if (!user) {
          consoleManager.error("User not found for document update");
          return null;
        }

        consoleManager.log("User documents updated successfully");
        return user;
      } else {
        // This case should ideally not be hit if we check for files at the start, but it's good practice
        consoleManager.log("No new document fields to update.");
        return await User.findById(userId).select('-password');
      }
    } catch (err) {
      consoleManager.error(`Error updating user documents: ${err.message}`);
      throw err;
    }
  }
  
    async getNumberOfUsers() {
      try {
        const count = await User.countDocuments();
        consoleManager.log(`Number of users: ${count}`);
        return count;
      } catch (err) {
        consoleManager.error(`Error counting users: ${err.message}`);
        throw err;
      }
    }

    async updateIncomesForMultipleUsers(phoneNumbers, amountToAdd) {
        try {
            // Use $inc to atomically increment the income field for all matching users
            const result = await User.updateMany(
                { phoneNumber: { $in: phoneNumbers } }, // Filter: find users whose phone number is in the array
                { $inc: { income: amountToAdd } }      // Update: increment the income field by the specified amount
            );

            consoleManager.log(`Successfully updated income for ${result.modifiedCount} users.`);
            return result;
        } catch (err) {
            consoleManager.error(`Error updating incomes for multiple users: ${err.message}`);
            throw err; // Re-throw the error to be handled by the calling service
        }
    }

    async getTotalIncome() {
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


    async clearAllIncome() {
      try {
      const result = await User.updateMany(
        {},
        { $set: { income: 0 } }
      );
      consoleManager.log(`Cleared income for ${result.modifiedCount} users.`);
      return result;
      } catch (err) {
      consoleManager.error(`Error clearing income fields: ${err.message}`);
      throw err;
      }
    }

}




export default new UserService();