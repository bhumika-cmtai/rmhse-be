import express from "express";
import WithdrawalService from "../../services/withdrawal/withdrawal_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new withdrawal
router.post('/createWithdrawal', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    // console.log(req.body)
    // Validate required fields
    if (!userId || !amount) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'userId and amount are required'
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'amount must be a positive number'
      );
    }

    const withdrawal = await WithdrawalService.createWithdrawal(userId, amount);
    // console.log(withdrawal)
    return ResponseManager.sendSuccess(
      res, 
      withdrawal, 
      201, 
      'Withdrawal created successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /createWithdrawal route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error creating withdrawal'
    );
  }
});

// Get all withdrawals (sorted by latest date)
router.get('/getAllWithdrawals', async (req, res) => {
  try {
    const withdrawals = await WithdrawalService.getAllWithdrawals();
    
    return ResponseManager.sendSuccess(
      res, 
      withdrawals, 
      200, 
      'All withdrawals retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getAllWithdrawals route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching withdrawals'
    );
  }
});

// Update a withdrawal
router.put('/updateWithdrawal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.createdOn;
    delete updateData._id;
    
    const withdrawal = await WithdrawalService.updateWithdrawal(id, updateData);
    
    if (!withdrawal) {
      return ResponseManager.sendError(
        res, 
        404, 
        'NOT_FOUND', 
        'Withdrawal not found'
      );
    }
    
    return ResponseManager.sendSuccess(
      res, 
      withdrawal, 
      200, 
      'Withdrawal updated successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /updateWithdrawal route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error updating withdrawal'
    );
  }
});

// Get withdrawals by user ID (sorted by latest date)
router.get('/getWithdrawalsByUserId/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'userId is required'
      );
    }
    
    const withdrawals = await WithdrawalService.getWithdrawalsByUserId(userId);
    
    return ResponseManager.sendSuccess(
      res, 
      withdrawals, 
      200, 
      'User withdrawals retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getWithdrawalsByUserId route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching user withdrawals'
    );
  }
});

// Get withdrawal by ID
router.get('/getWithdrawalById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'withdrawal ID is required'
      );
    }
    
    const withdrawal = await WithdrawalService.getWithdrawalById(id);
    
    if (!withdrawal) {
      return ResponseManager.sendError(
        res, 
        404, 
        'NOT_FOUND', 
        'Withdrawal not found'
      );
    }
    
    return ResponseManager.sendSuccess(
      res, 
      withdrawal, 
      200, 
      'Withdrawal retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getWithdrawalById route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching withdrawal'
    );
  }
});

export default router; 