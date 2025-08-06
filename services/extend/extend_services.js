import Extend from "../../models/extend/extendModel.js";
import User from "../../models/user/userModel.js";
import consoleManager from "../../utils/consoleManager.js";

class ExtendService {
  async createExtend(userId) {
    try {
      const extendData = {
        userId,
        createdOn: Date.now(),
        updatedOn: Date.now(),
        status: "pending"
      };

      const extend = new Extend(extendData);
      await extend.save();
      
      consoleManager.log("Extension request created successfully");
      return extend;
    } catch (err) {
      consoleManager.error(`Error creating extension request: ${err.message}`);
      throw err;
    }
  }

  async getAllExtends() {
    try {
      const extendRequests = await Extend.find()
        .populate('userId', 'name') // <-- THIS IS THE NEW LINE
        .sort({ createdOn: -1 }); // Sort by latest date first
      
      consoleManager.log("All extension requests retrieved successfully");
      return extendRequests;
    } catch (err) {
      consoleManager.error(`Error fetching all extension requests: ${err.message}`);
      throw err;
    }
  }

  async updateExtend(extendId, updateData) {
    try {
      updateData.updatedOn = Date.now();
      
      const extend = await Extend.findByIdAndUpdate(
        extendId, 
        updateData, 
        { new: true }
      );
      
      if (!extend) {
        consoleManager.error("Extension request not found for update");
        return null;
      }

      // If status is approved, update the user's limit by adding 25
      if (updateData.status === "approved") {
        const user = await User.findById(extend.userId);
        if (user) {
          const currentLimit = user.limit || 25;
          const newLimit = currentLimit + 25;
          
          await User.findByIdAndUpdate(
            extend.userId,
            { limit: newLimit, updatedOn: Date.now() }
          );
          
          consoleManager.log(`User ${extend.userId} limit updated from ${currentLimit} to ${newLimit}`);
        } else {
          consoleManager.error(`User ${extend.userId} not found for limit update`);
        }
      }
      
      consoleManager.log("Extension request updated successfully");
      return extend;
    } catch (err) {
      consoleManager.error(`Error updating extension request: ${err.message}`);
      throw err;
    }
  }

  async getExtendsByUserId(userId) {
    try {
      const extendRequests = await Extend.find({ userId })
        .sort({ createdOn: -1 }); // Sort by latest date first
      
      consoleManager.log(`Extension requests for user ${userId} retrieved successfully`);
      return extendRequests;
    } catch (err) {
      consoleManager.error(`Error fetching extension requests by user ID: ${err.message}`);
      throw err;
    }
  }

  async getExtendById(extendId) {
    try {
      const extend = await Extend.findById(extendId);
      
      if (!extend) {
        consoleManager.error("Extension request not found");
        return null;
      }
      
      consoleManager.log("Extension request retrieved successfully");
      return extend;
    } catch (err) {
      consoleManager.error(`Error fetching extension request by ID: ${err.message}`);
      throw err;
    }
  }
}

export default new ExtendService(); 