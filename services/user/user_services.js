import User from "../../models/user/userModel.js"
import Counter from "../../models/counter/counterModel.js";
import consoleManager from "../../utils/consoleManager.js";
// const User = require("../../models/user/userModel");
// const consoleManager = require("../../utils/consoleManager");
import { uploadToCloudinary } from '../../config/cloudinary.js';
import generateRoleId from '../../utils/generateRoleId.js'
import mongoose from "mongoose";
import fs from 'fs';
import { Console } from "console";

class UserService {
  async createUser(data, files = {}) {
   try {
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 409; 
        throw error;
      }

      const ids = await this.generateId(data.role)
      data.joinId = ids.joinId;
      data.roleId = [ids.roleId];

      data.createdOn =  Date.now();
      data.updatedOn =  Date.now();

      // --- NEW: Handle file uploads ---
      if (files.pancard) data.pancard = files.pancard[0].path;
      if (files.adharFront) data.adharFront = files.adharFront[0].path;
      if (files.adharBack) data.adharBack = files.adharBack[0].path;
      // --- END NEW ---

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

  async updateUserProfile(userId, profileData, file) {
    consoleManager.log("---- updatedUserProfile triggered ---- ")
    console.log("---- updatedUserProfile triggered ----")
    try {
      console.log("profileData",profileData)
      const updateFields = {
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
        permanentAddress: profileData.permanentAddress,
        fatherName: profileData.fatherName,
        currentAddress: profileData.currentAddress,
        dob: profileData.dob,
        gender: profileData.gender,
        emergencyNumber: profileData.emergencyNumber,
        updatedOn: Date.now(),
      };
      // console.log("----updatefiled----",updateFields)
      // console.log("----file----",file)

      // Only add the password to the update if it's a non-empty string
      if (profileData.newPassword) {
        // SECURITY WARNING: You should be hashing this password before saving!
        // Example: updateFields.password = await bcrypt.hash(profileData.newPassword, 10);
        updateFields.password = profileData.newPassword; 
      }
      
      // If a new file was uploaded, add its path (the Cloudinary URL) to the update
      if (file && file.path) {
        updateFields.profileImage = file.path;
        consoleManager.log(`Adding profile image to update: ${file.path}`);
      }

      // Remove any fields that were not provided to avoid overwriting with undefined
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });
      
      // Perform the database update with all the collected fields
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
      
      if (!user) {
        consoleManager.error("User not found for profile update");
        return null;
      }
      
      consoleManager.log("User profile updated successfully---");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user profile: ${err.message}`);
      throw err;
    }
  }
  // --- MODIFICATION END ---

  // --- MODIFICATION START ---
  // A specific service for updating user text details and documents.
  async updateUserDetails(userId, detailsData, files) {
    console.log("---user details update -----")

    try {
      const updateFields = {
        currentAddress: detailsData.currentAddress,
        permanentAddress: detailsData.permanentAddress,
        emergencyNumber: detailsData.emergencyNumber,
      };

      // Check for document files ONLY.
      if (files) {
        if (files.pancard && files.pancard[0]) {
          updateFields.pancard = files.pancard[0].path;
        }
        if (files.adharFront && files.adharFront[0]) {
          updateFields.adharFront = files.adharFront[0].path;
        }
        if (files.adharBack && files.adharBack[0]) {
          updateFields.adharBack = files.adharBack[0].path;
        }
      }

      updateFields.updatedOn = Date.now();
      updateFields.signupStep = "details"
      console.log("updateFields",updateFields)

      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined) delete updateFields[key];
      });
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
      if (!user) {
        return null;
      }
      console.log("update details user", user)
      
      consoleManager.log("User details and documents updated successfully");
      return user;
    } catch (err) {
      console.log("err in update details",err)
      consoleManager.error(`Error updating user details: ${err.message}`);
      throw err;
    }
  }
  // --- MODIFICATION END ---


  async updateUserByAdmin(userId, userData, files = {}) {
    try {
      const updateFields = { ...userData };
      console.log("----updateFields----", updateFields)
      // If a new password is provided in the form, it will be in `userData.password`.
      // The backend service should handle hashing it before saving.
      // NOTE: For security, you should hash this password.
      if (updateFields.password) {
        // Example with bcrypt (recommended):
        // const salt = await bcrypt.genSalt(10);
        // updateFields.password = await bcrypt.hash(updateFields.password, salt);
      } else {
        // If the password field is empty, remove it so it doesn't overwrite the existing one.
        delete updateFields.password;
      }
        // --- NEW: Handle file uploads for updates ---
      if (files.pancard) updateFields.pancard = files.pancard[0].path;
      if (files.adharFront) updateFields.adharFront = files.adharFront[0].path;
      if (files.adharBack) updateFields.adharBack = files.adharBack[0].path;
      // --- END NEW ---
      // Ensure fields that shouldn't be directly updated by an admin are removed.
      delete updateFields._id;
      delete updateFields.createdOn;

      updateFields.updatedOn = Date.now();
      
      const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
      
      if (!user) {
        consoleManager.error("User not found for admin update");
        return null;
      }
      
      consoleManager.log("User profile updated successfully by admin");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user by admin: ${err.message}`);
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
          { joinId : {$regex: searchQuery, $options: 'i'}},
          { "roleId": { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
          { latestRoleId: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Add the match stage if there are any filters
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

             // Sort by the createdOnDate field for correct ordering (oldest first)
       pipeline.push({ $sort: { createdOnDate: 1 } });

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
  

  async getReferredUsers(userId) {
    try {
      // Step 1: Find the source user to get their roleId array
      const sourceUser = await User.findById(userId).lean(); // .lean() for a plain JS object

      if (!sourceUser) {
        const error = new Error("Source user not found.");
        error.statusCode = 404;
        throw error;
      }

      // Step 2: Check if the user has any roleIds to search for. If not, they have no referrals.
      if (!sourceUser.roleId || sourceUser.roleId.length === 0) {
        consoleManager.log(`User ${sourceUser.email} has no roleIds, so no referrals found.`);
        return []; // Return an empty array
      }

      // Step 3: Use an aggregation pipeline to find and format the downline users
      const pipeline = [
        // Stage 1: Find all users whose 'refferedBy' field is one of the sourceUser's roleIds
        {
          $match: {
            'refferedBy': { $in: sourceUser.roleId }
          }
        },
        // Stage 2: Add a new field 'latestRoleId' by taking the last element of the roleId array
        {
          $addFields: {
            latestRoleId: { $arrayElemAt: ["$roleId", -1] }
          }
        },
        // Stage 3: Project only the fields that are required in the final output
        {
          $project: {
            _id: 1, // Usually good to keep the ID
            name: 1,
            phoneNumber: 1,
            status: 1,
            latestRoleId: 1,
            income: 1
          }
        }
      ];

      const referredUsers = await User.aggregate(pipeline);

      consoleManager.log(`Found ${referredUsers.length} users referred by ${sourceUser.email}.`);
      
      return referredUsers;

    } catch (err) {
      consoleManager.error(`Error in getReferredUsers service: ${err.message}`);
      throw err; // Re-throw the error to be handled by the route handler
    }
  }

  async getCommissionHistory(userId) {
    try {
      // 1. Validate and convert the incoming string ID to a proper ObjectId
      // This is still the correct and necessary way to handle route parameters.
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        consoleManager.error("Invalid user ID format provided.");
        return [];
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // 2. The aggregation pipeline now works seamlessly
      const pipeline = [
        {
          $match: {
            _id: userObjectId
          }
        },
        {
          $unwind: "$commision"
        },
        // This $lookup is now highly efficient because it matches ObjectId to ObjectId
        {
          $lookup: {
            from: "users",
            localField: "commision.userId", // This is now an ObjectId
            foreignField: "_id",            // This is also an ObjectId
            as: "sourceUserInfo"
          }
        },
        {
          $unwind: {
            path: "$sourceUserInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            amount: "$commision.amount",
            sourceUserName: { $ifNull: [ "$sourceUserInfo.name", "A Deleted User" ] },
            sourceUserLatestRoleId: {
              $ifNull: [ { $arrayElemAt: [ "$sourceUserInfo.roleId", -1 ] }, "N/A" ]
            }
          }
        },
        {
          $sort: { amount: -1 }
        }
      ];

      const commissionHistory = await User.aggregate(pipeline);
      
      consoleManager.log(`Fetched ${commissionHistory.length} commission records for user ${userId}.`);
      return commissionHistory;

    } catch (err) {
      consoleManager.error(`Error in getCommissionHistory service: ${err.message}`);
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

  // async updateUserProfile(userId, profileData) {
  //   try {
  //     const updateFields = {
  //       name: profileData.name,
  //       whatsappNumber: profileData.whatsappNumber,
  //       city: profileData.city,
  //       bio: profileData.bio,
  //       updatedOn: Date.now(),
  //       password: profileData.password
  //     };

  //     // Remove any fields that were not provided in the request body
  //     Object.keys(updateFields).forEach(key => {
  //       if (updateFields[key] === undefined) {
  //         delete updateFields[key];
  //       }
  //     });
      
  //     const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
  //     if (!user) {
  //       consoleManager.error("User not found for profile update");
  //       return null;
  //     }
      
  //     consoleManager.log("User profile updated successfully --- -- -- ");
  //     return user;
  //   } catch (err) {
  //     consoleManager.error(`Error updating user profile: ${err.message}`);
  //     throw err;
  //   }
  // }


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
        throw new Error("No files were provided for upload.");
      }
      const updateFields = {};
      if (files.pancard) {
        updateFields.pancard = files.pancard[0].path; // This path is the Cloudinary URL
      }
      if (files.adharFront) {
        updateFields.adharFront = files.adharFront[0].path;
      }
      if (files.adharBack) {
        updateFields.adharBack = files.adharBack[0].path;
      }
      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedOn = Date.now();
        const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');
        if (!user) return null;
        return user;
      }
      return await User.findById(userId).select('-password');
    } catch (err) {
      console.error(`Error in updateDocument service: ${err.message}`);
      throw err;
    }
  }


  // =================================================================
  // NEW FUNCTION FOR DISTRIBUTING COMMISSION
  // =================================================================
  async distributeIncome(initialReferrerRoleId, sourceUserId) {
    try {
      if (!initialReferrerRoleId || initialReferrerRoleId === "admin123") {
        consoleManager.log("No valid referrer provided, skipping commission distribution.");
        return;
      }
      
      if (!sourceUserId) {
          consoleManager.error("Source User ID was not provided to distributeIncome. Aborting.");
          return;
      }

      const TOTAL_COMMISSION_BUDGET = 350;
      const BM_PAYOUT = 10;
      const referralPayouts = { "DIV": 70, "DIST": 40, "STAT": 20 };

      let totalPaidOut = 0;
      let currentReferrerRoleId = initialReferrerRoleId;
      let safetyCounter = 0;

      consoleManager.log(`Starting commission distribution for user ${sourceUserId}, chain starts with: ${currentReferrerRoleId}`);

      // --- 1. Pay out the direct referral chain ---
      while (currentReferrerRoleId && currentReferrerRoleId !== "ADMIN001" && safetyCounter < 10) {
        const referrer = await User.findOne({ roleId: currentReferrerRoleId });
        if (!referrer) {
          consoleManager.warn(`Referrer with roleId '${currentReferrerRoleId}' not found. Stopping chain.`);
          break;
        }

        // --- NEW LOGIC (1): CHECK IF REFERRER IS A BM ---
        if (referrer.role === "BM") {
          consoleManager.log(`Referrer ${referrer.email} is a BM. Halting chain here as BMs are paid separately.`);
          break; // Stop the loop for this chain
        }
        // --- END OF NEW LOGIC ---

        const payout = referralPayouts[referrer.role];
        if (payout) {
          const commissionObject = { amount: payout, userId: sourceUserId };
          await User.findByIdAndUpdate(referrer._id, { 
            $push: { commision: commissionObject },
            $inc: { income: payout }
          });
          totalPaidOut += payout;
          consoleManager.log(`Paid commission of ${payout} to ${referrer.role} user: ${referrer.email}.`);
        }
        
        if (referrer.role === "STAT") {
            break;
        }
        
        currentReferrerRoleId = referrer.refferedBy;
        safetyCounter++;
      }
      
      // --- 2. Pay out to ALL BM users ---
      const bmUsers = await User.find({ role: "BM" });
      if (bmUsers.length > 0) {
        for (const bmUser of bmUsers) {
          const commissionObject = { amount: BM_PAYOUT, userId: sourceUserId };
          await User.findByIdAndUpdate(bmUser._id, { 
            $push: { commision: commissionObject },
            $inc: { income: BM_PAYOUT }
          });
          totalPaidOut += BM_PAYOUT;
        }
        consoleManager.log(`Paid commission of ${BM_PAYOUT} to each of the ${bmUsers.length} BM users.`);
      }

      // --- 3. Pay any final remaining amount to the Admin ---
      const adminAmount = TOTAL_COMMISSION_BUDGET - totalPaidOut;
      if (adminAmount > 0) {
        const adminUser = await User.findOne({ role: "admin" });
        if (adminUser) {
          const commissionObject = { amount: adminAmount, userId: sourceUserId };
          // --- NEW LOGIC (2): INCREMENT ADMIN INCOME ---
          await User.findByIdAndUpdate(adminUser._id, { 
            $push: { commision: commissionObject },
            $inc: { income: adminAmount }
          });
          // --- END OF NEW LOGIC ---
          consoleManager.log(`Paid remaining commission of ${adminAmount} to admin user: ${adminUser.email}`);
        } else {
            consoleManager.warn(`Admin user not found to pay the final remaining amount.`);
        }
      }

      consoleManager.log("Commission distribution completed.");
    } catch (error) {
      consoleManager.error(`Error during commission distribution: ${error.message}`);
      throw error;
    }
  }

  // =================================================================
  // MODIFIED FUNCTION: ACTIVATE USER
  // =================================================================
  async activateUser(userId, refferedBy) {
    try {
      console.log("---refferredBy---", refferedBy)
      const updateFields = {
        refferedBy: refferedBy,
        status: 'active',
        role: 'MEM',
        paymentStatus: 'completed',
        updatedOn: Date.now(),
      };
      const ids = await this.generateId("MEM")
      console.log("----ids----", ids)
      const roleId = [ids.roleId];
      updateFields.joinId = ids.joinId;

      const user = await User.findByIdAndUpdate(
        userId, 
        { 
          $set: updateFields,
          $push: { roleId: roleId },
        }, 
        { new: true }
      ).select('-password');

      if (!user) {
        consoleManager.error("User not found for activation");
        return null;
      }
      
      consoleManager.log("User activated successfully. Now distributing income...");
      
      // --- TRIGGER COMMISSION DISTRIBUTION ---
      // Pass both the referrer's role ID and the new user's own ID
      await this.distributeIncome(user.refferedBy, user._id);

      return user;
    } catch (err) {
      consoleManager.error(`Error activating user: ${err.message}`);
      throw err;
    }
  }

  async countReferredUsers(userId) {
    try {
      // Step 1: Find the user to get their roleId array. .lean() is efficient for read-only operations.
      const sourceUser = await User.findById(userId).lean();

      // Step 2: Handle cases where the user doesn't exist.
      if (!sourceUser) {
        consoleManager.error(`User not found for referral count: ${userId}`);
        // Throw an error that the route can catch and convert to a 404 response.
        throw new Error("User not found.");
      }

      // Step 3: Handle cases where the user has no roleIds. They can't have referrals.
      if (!sourceUser.roleId || sourceUser.roleId.length === 0) {
        consoleManager.log(`User ${userId} has no roleIds, referral count is 0.`);
        return 0;
      }

      // Step 4: Use the efficient `countDocuments` to find all users whose 'refferedBy' field
      // contains any of the IDs from the source user's roleId array.
      const count = await User.countDocuments({
        'refferedBy': { $in: sourceUser.roleId }
      });

      consoleManager.log(`Found ${count} users referred by user ${userId}.`);
      
      return count;

    } catch (err) {
      // Re-throw other errors to be handled by the route handler.
      consoleManager.error(`Error in countReferredUsers service: ${err.message}`);
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

    // NEW SERVICE: UPGRADE USER's ROLE
  // =================================================================
  async upgradeUserRole(userId) {
    try {
      // 1. Define the upgrade and referrer hierarchies for clarity and maintenance
      const upgradeHierarchy = {
        'MEM': 'DIV',
        'DIV': 'DIST',
        'DIST': 'STAT'
      };
      
      const referrerRoleHierarchy = {
        'DIV': 'DIST', // A new DIV user is referred by a random DIST user
        'DIST': 'STAT'  // A new DIST user is referred by a random STAT user
      };

      // 2. Find the current user
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      // 3. Determine the user's next role
      const nextRole = upgradeHierarchy[currentUser.role];
      if (!nextRole) {
        const error = new Error("You are already at the highest role or your current role cannot be upgraded.");
        error.statusCode = 400;
        throw error;
      }

      // --- NEW LOGIC: FIND THE NEW REFERRER ---
      let newReferredBy = "ADMIN001";
      const targetReferrerRole = referrerRoleHierarchy[nextRole];
      
      if (targetReferrerRole) {
        // Find all users who can act as a referrer (e.g., all 'DIST' users)
        const potentialReferrers = await User.find({ role: targetReferrerRole });

        if (potentialReferrers.length === 0) {
          // This is a critical business logic failure. An upgrade cannot proceed without an upline.
          const error = new Error(`Cannot complete upgrade because no users with the required referrer role ('${targetReferrerRole}') were found.`);
          error.statusCode = 409; // 409 Conflict is a good status for a business logic error
          throw error;
        }
        // --- NEW LOGIC: VERIFY REFERRAL LIMITS ---
                // 2. Fetch the current referral count for each potential referrer
                const referrersWithCounts = await Promise.all(
                  potentialReferrers.map(async (referrer) => {
                      const count = await this.countReferredUsers(referrer._id);
                      return { referrer, count };
                  })
              );

              // 3. Filter down to only those who are below their limit
              const eligibleReferrers = referrersWithCounts.filter(item => {
                  const limit = item.referrer.limit || 25; // Use default limit if not set
                  return item.count < limit;
              });
              console.log("-----eligibleReferrers-----",eligibleReferrers)
              if (eligibleReferrers.length === 0) {
                  throw new Error(`All available referrers in the '${targetReferrerRole}' tier have reached their capacity. Please contact support.`);
              }
              // --- END OF NEW LOGIC ---

        // Randomly select one of these users
        const randomIndex = Math.floor(Math.random() * potentialReferrers.length);
        const randomReferrer = potentialReferrers[randomIndex];

        // Ensure the selected referrer has a valid roleId history
        console.log(randomReferrer)
        if (!randomReferrer.roleId || randomReferrer.roleId.length === 0) {
            const error = new Error(`Data integrity error: The selected referrer (${randomReferrer.email}) has no role ID history.`);
            error.statusCode = 500;
            throw error;
        }

        // Assign the latest roleId of the randomly selected referrer
        newReferredBy = randomReferrer.roleId[randomReferrer.roleId.length - 1];
        consoleManager.log(`Assigning new referrer for user ${currentUser.email}. New referrer roleId: ${newReferredBy}`);

      } else {
        // This case handles a user becoming 'STAT', who is at the top of the chain
        newReferredBy = 'ADMIN001'; // Or null, depending on your system's design for top-level users
        consoleManager.log(`User ${currentUser.email} is becoming a STAT, assigning admin as referrer.`);
      }
      // --- END OF NEW LOGIC ---

      // 5. Generate the new roleId for the user who is upgrading
      // const newRoleId = generateRoleId(nextRole);
      const { roleId: newRoleId } = await this.generateId(nextRole);

      // 6. Perform the atomic update in the database with all new fields
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: { 
            role: nextRole,           // Set the new primary role
            refferedBy: newReferredBy // Set the new referrer ID
          },      
          $push: { roleId: newRoleId }  // Add the new roleId to the user's history
        },
        { new: true } // Return the modified document
      ).select('-password');

      if (!updatedUser) {
          const error = new Error("Failed to update user during upgrade.");
          error.statusCode = 500;
          throw error;
      }

      consoleManager.log(`User ${currentUser.email} successfully upgraded from ${currentUser.role} to ${nextRole}.`);
      
      return updatedUser; // Return the full, updated user object to the frontend

    } catch (err) {
      // Catch and re-throw errors to be handled by the route
      consoleManager.error(`Error in upgradeUserRole service: ${err.message}`);
      throw err;
    }
  }

   async generateId(role) {
    try {
      // Step 1: Get the current date part (DDMMYY). This remains the same.
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const datePart = `${day}${month}${year}`;
      
      // Step 2: Count all existing users in the database.
      // NOTE: This is the non-atomic part that can cause a race condition.
      const totalUsers = await User.countDocuments();

      // Step 3: The new user's sequence number will be the total count + 1.
      // For example, if there are 32 users, this will be 33.
      const nextSequenceNumber = totalUsers + 1;

      // Step 4: Pad the sequence number to ensure consistent length (e.g., 4 digits).
      const sequencePart = String(nextSequenceNumber).padStart(4, '0');

      // Step 5: Construct the final IDs.
      const joinId = `RMHSE${datePart}${sequencePart}`;
      const roleId = `${role}${datePart}${sequencePart}`;
  
      consoleManager.log(`Generated ID based on user count: ${joinId}, Role ID: ${roleId}`);
      return { joinId, roleId };
  
    } catch (error) {
      consoleManager.error(`Error during ID generation by count: ${error.message}`);
      throw new Error('Could not generate a unique Member ID.');
    }
  }

}

export default new UserService();