import consoleManager from "../../utils/consoleManager.js";
import Register from "../../models/registeration/registerationModel.js";

class RegisterService {
  async createRegister(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      const existingRegister = await Register.findOne({phoneNumber: data.phoneNumber})
      
      if (existingRegister) {
        const error = new Error("A register with this phone Number already exists.");
        error.statusCode = 409; 
        throw error;
      }

      data.createdOn =  Date.now();

      const register = new Register(data);
      await register.save();
      consoleManager.log("Register created successfully");
      return register;
    } catch (err) {
      consoleManager.error(`Error creating register: ${err.message}`);
      throw err;
    }
  }


  async getRegisterById(registerId) {
    try {
      const register = await Register.findById(registerId);
      if (!register) {
        consoleManager.error("register not found");
        return null;
      }
      return register;
    } catch (err) {
      consoleManager.error(`Error fetching register: ${err.message}`);
      throw err;
    }
  }

  async updateRegister(registerId, data) {
    try {
      data.updatedOn = Date.now();
      const register = await Register.findByIdAndUpdate(registerId, data, { new: true });
      if (!register) {
        consoleManager.error("register not found for update");
        return null;
      }
      consoleManager.log("register updated successfully");
      return register;
    } catch (err) {
      consoleManager.error(`Error updating register: ${err.message}`);
      throw err;
    }
  }

  async deleteRegister(registerId) {
    try {
      const register = await Register.findByIdAndDelete(registerId);
      if (!register) {
        consoleManager.error("register not found for deletion");
        return null;
      }
      consoleManager.log("register deleted successfully");
      return register;
    } catch (err) {
      consoleManager.error(`Error deleting register: ${err.message}`);
      throw err;
    }
    }

  async deleteManyRegisters(registerIds) {
    try {
      const result = await Register.deleteMany({ _id: { $in: registerIds } });
      consoleManager.log(`Deleted ${result.deletedCount} registers.`);
      return result;
    } catch (err) {
      consoleManager.error(`Error deleting registers: ${err.message}`);
      throw err;
    }
  }

  async getAllRegisters(name='',phoneNumber = '', leaderCode='' ,status, page = 1, limit = 15) {
    try {
      const filterQuery = {};
      
      if (phoneNumber) {
        filterQuery.phoneNumber = { $regex: `^${phoneNumber}$`, $options: 'i' };
      }

      if (leaderCode) {
        filterQuery.leaderCode = leaderCode;
      }
  
      if (status) {
        filterQuery.status = status;
      }
      if (name) {
        // Use $regex for a "contains" search and $options: 'i' for case-insensitivity
        filterQuery.name = { $regex: name, $options: 'i' };
      }

      const registers = await Register.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      const totalRegisters = await Register.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalRegisters / limit);
  
      return {
        registers, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalRegisters
      };
    } catch (err) {
      consoleManager.error(`Error fetching registers: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfRegisters() {
    try {
      const count = await Register.countDocuments();
      consoleManager.log(`Number of Registers: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting registers: ${err.message}`);
      throw err;
    }
  }

  async getRegistersCountByDateRange(startDate, endDate) {
    try {
      const startTimestamp = new Date(startDate).setUTCHours(0, 0, 0, 0);

      // To include the entire endDate, we get the start of the *next* day.
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      const endTimestamp = endOfDay.getTime();

      const filter = {
        createdOn: {
          $gte: String(startTimestamp), 
          $lte: String(endTimestamp)   
        }
      };
      
      /*
      // --- This is the SIMPLER logic if you change `createdOn` to type: Date ---
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const filter = {
          createdOn: {
              $gte: startOfDay,
              $lte: endOfDay
          }
      };
      */

      const count = await Register.countDocuments(filter);
      consoleManager.log(`Found ${count} registers created between ${startDate} and ${endDate}`);
      return count;

    } catch (err) {
      consoleManager.error(`Error counting registers by date range: ${err.message}`);
      throw err;
    }
  }

}

export default new RegisterService();