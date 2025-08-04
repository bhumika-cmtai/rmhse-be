import express from "express"
// import RegisterationService from "../../services/register/register_services.js";
import RegisterationService from "../../services/registeration/registeration_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new user
router.post('/addRegister', async (req, res) => {
    try {
      const register = await RegisterationService.createRegister(req.body);
      return ResponseManager.sendSuccess(res, register, 201, 'register created successfully');
    } 
    catch (err) {
    if (err.statusCode) {
      return ResponseManager.sendError(res, err.statusCode, 'phone_number_exist', err.message);
    } else {
      console.error(err); 
      console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred while creating the register.');
    }
    
  }
  });


// Get a register by ID
router.get('/getRegister/:id', async (req, res) => {
  try {
    const register = await RegisterationService.getRegisterById(req.params.id);
    if (register) {
      ResponseManager.sendSuccess(res, register, 200, 'register retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'register not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching register');
  }
});

// Update a register by ID
router.put('/updateRegister/:id', async (req, res) => {
    try {
  
      const register = await RegisterationService.updateRegister(req.params.id, req.body);
      if (register) {
        return ResponseManager.sendSuccess(res, register, 200, 'register updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'register not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating register');
    }
  });

// Delete a register by ID
router.delete('/deleteRegister/:id', async (req, res) => {
  try {
    const register = await RegisterationService.deleteRegister(req.params.id);
    if (register) {
      ResponseManager.sendSuccess(res, register, 200, 'register deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'register not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting register');
  }
});

router.delete('/deleteManyRegisters', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'ids array is required');
    }
    const result = await RegisterationService.deleteManyRegisters(ids);
    return ResponseManager.sendSuccess(res, result, 200, 'Registers deleted successfully');
  } catch (err) { 
    consoleManager.error(`Error in /deleteManyRegisters route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting registers');
  }
});

// Get all register
router.get('/getAllRegister', async (req, res) => {
  try {
    const { name, phoneNumber, leaderCode, status, page = 1, limit = 15 } = req.query;
    const result = await RegisterationService.getAllRegisters(name, phoneNumber, leaderCode, status, page, limit);

    return ResponseManager.sendSuccess(
      res, 
      {
        registers: result.registers,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalRegisters: result.totalRegisters
      }, 
      200, 
      'register retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching register: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching register');
  }
});



router.get('/getRegistersCount', async (req, res) => {
  try {
    const count = await RegisterationService.getNumberOfRegisters();

    return ResponseManager.sendSuccess(
      res, 
      { count: count }, 
      200, 
      'registers count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getRegistersCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching register count'
    );
  }
})

// // Toggle register status
// router.put('/removeRegister/:id', async (req, res) => {
//   try {
//     const register = await RegisterationService.toggleUserStatus(req.params.id);
//     if (register) {
//       ResponseManager.sendSuccess(res, register, 200, 'register status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'register not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling register status');
//   }
// });

router.post('/getRegistersCountByDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Basic validation
    if (!startDate || !endDate) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'Both startDate and endDate are required in the request body.');
    }

    const count = await RegisterationService.getRegistersCountByDateRange(startDate, endDate);
    
    const responseData = {
      count: count,
      startDate: startDate,
      endDate: endDate
    };

    return ResponseManager.sendSuccess(res, responseData, 200, 'Register count retrieved successfully for the specified date range.');

  } catch (err) {
    consoleManager.error(`Error in /getRegistersCountByDate route: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching register count by date range.');
  }
});


router.get('/getRegisteredCount', async (req, res) => {
  try {
    const count = await RegisterationService.getNumberOfRegisters();
    return ResponseManager.sendSuccess(
      res,
      { count },
      200,
      'Registered count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getRegisteredCount route: ${err.message}`);
    return ResponseManager.sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'Error fetching registered count'
    );
  }
});

export default router;