import express from "express";
import ExtendService from "../../services/extend/extend_services.js";
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new extension request
router.post('/createExtend', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'userId is required'
      );
    }

    const extend = await ExtendService.createExtend(userId);
    
    return ResponseManager.sendSuccess(
      res, 
      extend, 
      201, 
      'Extension request created successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /createExtend route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error creating extension request'
    );
  }
});

// Get all extension requests (sorted by latest date)
router.get('/getAllExtends', async (req, res) => {
  try {
    const extendRequests = await ExtendService.getAllExtends();
    
    return ResponseManager.sendSuccess(
      res, 
      extendRequests, 
      200, 
      'All extension requests retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getAllExtends route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching extension requests'
    );
  }
});

// Update an extension request
router.put('/updateExtend/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.createdOn;
    delete updateData._id;
    
    const extend = await ExtendService.updateExtend(id, updateData);
    
    if (!extend) {
      return ResponseManager.sendError(
        res, 
        404, 
        'NOT_FOUND', 
        'Extension request not found'
      );
    }
    
    return ResponseManager.sendSuccess(
      res, 
      extend, 
      200, 
      'Extension request updated successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /updateExtend route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error updating extension request'
    );
  }
});

// Get extension requests by user ID (sorted by latest date)
router.get('/getExtendsByUserId/:userId', async (req, res) => {
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
    
    const extendRequests = await ExtendService.getExtendsByUserId(userId);
    
    return ResponseManager.sendSuccess(
      res, 
      extendRequests, 
      200, 
      'User extension requests retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getExtendsByUserId route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching user extension requests'
    );
  }
});

// Get extension request by ID
router.get('/getExtendById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return ResponseManager.sendError(
        res, 
        400, 
        'BAD_REQUEST', 
        'extension request ID is required'
      );
    }
    
    const extend = await ExtendService.getExtendById(id);
    
    if (!extend) {
      return ResponseManager.sendError(
        res, 
        404, 
        'NOT_FOUND', 
        'Extension request not found'
      );
    }
    
    return ResponseManager.sendSuccess(
      res, 
      extend, 
      200, 
      'Extension request retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getExtendById route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching extension request'
    );
  }
});

export default router; 