import express from "express";
import CountService from "../../services/count/count_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Fetch total users
router.get('/fetchTotalUsers', async (req, res) => {
  try {
    const count = await CountService.fetchTotalUsers();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalUsers route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total users count'
    );
  }
});

// Fetch total BM users
router.get('/fetchTotalBM', async (req, res) => {
  try {
    const count = await CountService.fetchTotalBM();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total BM users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalBM route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total BM users count'
    );
  }
});

// Fetch total DIV users
router.get('/fetchTotalDIV', async (req, res) => {
  try {
    const count = await CountService.fetchTotalDIV();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total DIV users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalDIV route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total DIV users count'
    );
  }
});

// Fetch total DIST users
router.get('/fetchTotalDIST', async (req, res) => {
  try {
    const count = await CountService.fetchTotalDIST();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total DIST users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalDIST route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total DIST users count'
    );
  }
});

// Fetch total STAT users
router.get('/fetchTotalSTAT', async (req, res) => {
  try {
    const count = await CountService.fetchTotalSTAT();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total STAT users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalSTAT route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total STAT users count'
    );
  }
});

// Fetch total regular users
router.get('/fetchTotalRegularUser', async (req, res) => {
  try {
    const count = await CountService.fetchTotalRegularUser();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total regular users count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalRegularUser route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total regular users count'
    );
  }
});

// Fetch total income
router.get('/fetchTotalIncome', async (req, res) => {
  try {
    const totalIncome = await CountService.fetchTotalIncome();
    return ResponseManager.sendSuccess(
      res, 
      { totalIncome }, 
      200, 
      'Total income retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalIncome route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total income'
    );
  }
});

// Fetch total withdrawal requests
router.get('/fetchTotalWithdrawalRequests', async (req, res) => {
  try {
    const count = await CountService.fetchTotalWithdrawalRequests();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total withdrawal requests count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalWithdrawalRequests route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total withdrawal requests count'
    );
  }
});

// Fetch total extend requests
router.get('/fetchTotalExtendRequest', async (req, res) => {
  try {
    const count = await CountService.fetchTotalExtendRequest();
    return ResponseManager.sendSuccess(
      res, 
      { count }, 
      200, 
      'Total extend requests count retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalExtendRequest route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching total extend requests count'
    );
  }
});

// Fetch total income by user ID
router.get('/fetchTotalIncomeByUserId/:userId', async (req, res) => {
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
    
    const totalIncome = await CountService.fetchTotalIncomeByUserId(userId);
    return ResponseManager.sendSuccess(
      res, 
      { totalIncome }, 
      200, 
      'User total income retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalIncomeByUserId route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching user total income'
    );
  }
});

// Fetch total limits by user ID
router.get('/fetchTotalLimitsByUserId/:userId', async (req, res) => {
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
    
    const totalLimit = await CountService.fetchTotalLimitsByUserId(userId);
    return ResponseManager.sendSuccess(
      res, 
      { totalLimit }, 
      200, 
      'User total limit retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /fetchTotalLimitsByUserId route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching user total limit'
    );
  }
});

export default router;


