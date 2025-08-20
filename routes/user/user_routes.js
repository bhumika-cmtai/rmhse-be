import express from "express"
import UserService from "../../services/user/user_services.js"

import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
import jwt from 'jsonwebtoken';
import authMiddleware from '../../middleware/authMiddleware.js'; // Import the new middleware
import User from '../../models/user/userModel.js'; 
import { documentUpload, profileImageUpload } from '../../middleware/multer.js'




const router = express.Router();

//create a user 
router.post('/addUser', documentUpload,async (req, res) => {
  try {
    // Extract fields from the request body
    if (!req.body.name) {
      return ResponseManager.handleBadRequestError(res, 'Name is required');
    }

    if (!req.body.email) {
      return ResponseManager.handleBadRequestError(res, 'Email is required');
    }
    
    if (!req.body.password) {
      return ResponseManager.handleBadRequestError(res, 'Password is required');
    }

    if (!req.body.phoneNumber) {
      return ResponseManager.handleBadRequestError(res, 'Primary phone is required');
    }

    if (!req.body.role) {
      return ResponseManager.handleBadRequestError(res, 'Role is required');
    }

    // Create the user if all required fields are present
    const user = await UserService.createUser(req.body, req.files);
    return ResponseManager.sendSuccess(res, user, 201, 'User created successfully');
  } catch (err) {

  if (err.statusCode) {
    return ResponseManager.sendError(res, err.statusCode, 'EMAIL_ALREADY_EXISTS', err.message);
  } else {
    console.error(err); 
    return ResponseManager.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred while creating the user.');
  }
  
}
});



// Get a user by ID
router.get('/getUser/:id', async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (user) {
      ResponseManager.sendSuccess(res, user, 200, 'User retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'User not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching user');
  }
});

// Update a user by ID
router.put('/update-document', 
  authMiddleware,      // 2. First, authenticate the user
  documentUpload,      // 3. THEN, process the uploaded files with Multer
  async (req, res) => {
    try {
      // 4. Pass req.files to the service, not req.body
      const updatedUser = await UserService.updateDocument(req.user.id, req.files);
      
      if (updatedUser) {
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'User documents updated successfully');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      console.error(err); // Good practice to log the actual error on the server
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Error updating user documents';
      return ResponseManager.sendError(res, statusCode, 'INTERNAL_ERROR', message);
    }
});

// Delete a user by ID
router.delete('/deleteUser/:id', async (req, res) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (user) {
      ResponseManager.sendSuccess(res, user, 200, 'User deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'User not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting user');
  }
});

//delete many users
router.delete('/deleteManyUsers', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'ids array is required');
    }
    const result = await UserService.deleteManyUsers(ids);
    return ResponseManager.sendSuccess(res, result, 200, 'Users deleted successfully');
  } catch (err) {
    consoleManager.error(`Error in /deleteManyUsers route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting users');
  }
});

// Get all users
router.get('/getAllUsers', async (req, res) => {
  try {
    // MODIFICATION: Destructure `role` from the query
    const { searchQuery, status, role, page = 1, limit = 15, month, year } = req.query;
    // console.log(role)

    // MODIFICATION: Pass `role` to the service method
    const result = await UserService.getAllUsers(searchQuery, status, role, page, limit, month, year);
    // console.log(searchQuery)
    if (!result || result.users.length === 0) {
      return ResponseManager.sendSuccess(res, {
        users: [],
        totalPages: 0,
        currentPage: parseInt(page, 10),
        totalUsers: 0
      }, 200, 'No users found');
    }

    // This filter is good for security, ensuring admins are never leaked via this route.
    const filteredUsers = result.users.filter(user => user.role !== 'admin');
    // console.log(filteredUsers)
    return ResponseManager.sendSuccess(
      res, 
      {
        users: filteredUsers,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalUsers: result.totalUsers
      }, 
      200, 
      'Users retrieved successfully'
    );
  } catch (err) {
    console.log(err)
    console.error(`Error fetching users: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching users'
    );
  }
});

router.get('/downline/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return ResponseManager.handleBadRequestError(res, 'User ID parameter is required.');
    }
    
    // In a real-world scenario, you might add extra authorization here.
    // For example, check if req.user.id is an admin or if req.user.id === userId
    
    const downline = await UserService.getReferredUsers(userId);

    // The service returns an array, which could be empty. This is a successful state.
    return ResponseManager.sendSuccess(res, downline, 200, 'Referred users retrieved successfully.');

  } catch (err) {
    console.error(`Error in /downline/:userId route:`, err);
    const statusCode = err.statusCode || 500;
    return ResponseManager.sendError(res, statusCode, 'DOWNLINE_FETCH_FAILED', err.message);
  }
});

router.get('/commission-history', authMiddleware, async (req, res) => {
  try {
    // The user's ID is securely taken from their authentication token.
    // This prevents them from requesting anyone else's data.
    const userId = req.user.id;

    const history = await UserService.getCommissionHistory(userId);
    
    return ResponseManager.sendSuccess(res, history, 200, 'Commission history retrieved successfully.');

  } catch (err) {
    console.error(`Error in /commission-history route:`, err);
    const statusCode = err.statusCode || 500;
    return ResponseManager.sendError(res, statusCode, 'HISTORY_FETCH_FAILED', err.message);
  }
});


router.get('/commission-history/:userId', async (req, res) => {
  try {
    // Optional: Add a check to ensure only admins can access this
    // if (req.user.role !== 'admin') {
    //   return ResponseManager.sendError(res, 403, 'FORBIDDEN', 'You do not have permission to view this data.');
    // }

    const { userId } = req.params;
    const history = await UserService.getCommissionHistory(userId);
    
    return ResponseManager.sendSuccess(res, history, 200, 'Commission history retrieved successfully.');

  } catch (err) {
    console.error(`Error in /commission-history/:userId route:`, err);
    const statusCode = err.statusCode || 500;
    return ResponseManager.sendError(res, statusCode, 'HISTORY_FETCH_FAILED', err.message);
  }
});

// POST /api/auth/user/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return ResponseManager.sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // IMPORTANT: This assumes you are hashing passwords when you create users.
        if (password!==user.password) {
            return ResponseManager.sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

        const userResponse = user.toObject();
        delete userResponse.password; // Never send the password hash back to the client

        ResponseManager.sendSuccess(res, { token, user: userResponse }, 200, 'Login successful');
    } catch (err) {
        console.error("Login Error:", err);
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Server error during login');
    }
});

// GET /api/auth/user/me - Get current logged-in user's details
// This route is protected by the authMiddleware
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    if (!user) {
      return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found');
    }
    ResponseManager.sendSuccess(res, user, 200, 'User details retrieved successfully');
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching user details');
  }
});

// PUT /api/auth/user/update-profile - Update profile for the logged-in user
// This route is also protected
// This route correctly handles the update for personal details + profile image.
router.put(
  '/update-profile', 
  authMiddleware,       // 1. Authenticate user
  profileImageUpload,   // 2. Process a single file named 'profileImage'
  async (req, res) => {
    try {
      // 3. Pass req.body and req.file to the service. This is correct.
      const updatedUser = await UserService.updateUserProfile(req.user.id, req.body, req.file);
      
      if (updatedUser) {
        // console.log("---updatedUser---",updatedUser)
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'User profile updated successfully');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      console.error(err);
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating user profile');
    }
});


router.put(
  '/updateUser/:id',   // 2. Authorize: Check if the user is an admin
  documentUpload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUserByAdmin(id, req.body, req.files);
      
      if (updatedUser) {
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'User profile updated successfully by admin');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      console.error(err);
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating user profile');
    }
});


// --- MODIFICATION START ---
// PUT /api/auth/user/update-profile - Update profile (including image) for the logged-in user
// --- MODIFICATION START ---
// This route now uses the 'documentUpload' middleware, which matches the frontend.
router.put('/update-details', 
  authMiddleware,       // 1. Authenticate
  documentUpload,       // 2. Use middleware for documents ONLY
  async (req, res) => {
    try {
      // 3. The service receives text data (req.body) and document files (req.files)
      const updatedUser = await UserService.updateUserDetails(req.user.id, req.body, req.files);
      
      if (updatedUser) {
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'User details and documents updated successfully');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      console.error(err);
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating user details');
    }
});
// --- MODIFICATION END ---

// PUT /api/auth/user/update-bank - Update bank details for the logged-in user
// This route is also protected
router.put('/update-bank', authMiddleware, async (req, res) => {
    try {
      const updatedUser = await UserService.updateBankDetails(req.user.id, req.body);
      if (updatedUser) {
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'Bank details updated successfully');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating bank details');
    }
});

// PUT /api/auth/user/update-document - Update document images for the logged-in user
router.put('/update-document', 
  authMiddleware,      // 2. First, authenticate the user
  documentUpload,      // 3. THEN, process the uploaded files with Multer
  async (req, res) => {
    try {
      // 4. Pass req.files to the service, not req.body
      const updatedUser = await UserService.updateDocument(req.user.id, req.files);
      
      if (updatedUser) {
        return ResponseManager.sendSuccess(res, updatedUser, 200, 'User documents updated successfully');
      } else {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for update');
      }
    } catch (err) {
      console.error(err); // Good practice to log the actual error on the server
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Error updating user documents';
      return ResponseManager.sendError(res, statusCode, 'INTERNAL_ERROR', message);
    }
});


// =================================================================
// NEW ROUTE FOR ACTIVATING A USER AFTER PAYMENT
// =================================================================
router.put('/activate-user', async (req, res) => {
  try {
    const { userId, refferedBy } = req.body;
    console.log("----active-user----", refferedBy)
    if (!userId || !refferedBy) {
      return ResponseManager.handleBadRequestError(res, 'userId, roleId, and refferedBy are required');
    }
    
    const activatedUser = await UserService.activateUser(userId, refferedBy);

    if (activatedUser) {
      console.log("---/activate-User---", activatedUser)
      return ResponseManager.sendSuccess(res, activatedUser, 200, 'User activated successfully');
    } else {
      return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'User not found for activation');
    }
  } catch (err) {
    console.error(err);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error activating user');
  }
});

// NEW ROUTE: UPGRADE a user's role
// =================================================================
router.put('/upgrade-role', authMiddleware, async (req, res) => {
  try {
    // The user's ID is securely obtained from the auth token via the middleware
    const userId = req.user.id;

    const updatedUser = await UserService.upgradeUserRole(userId);

    // If the service function succeeds, it returns the updated user object.
    return ResponseManager.sendSuccess(res, updatedUser, 200, 'User role upgraded successfully.');

  } catch (err) {
    console.error(err); // Log the full error for debugging

    // The service throws errors with specific status codes (404, 400).
    // If no code is present, default to 500 for an internal server error.
    const statusCode = err.statusCode || 500;
    
    // Provide a clear error code and message to the frontend.
    return ResponseManager.sendError(res, statusCode, 'UPGRADE_FAILED', err.message);
  }
});

router.get('/generate-ids', async (req, res) => {
  try {
      const { role } = req.query;

      // 1. Validate that the 'role' parameter was provided
      if (!role || typeof role !== 'string') {
          return ResponseManager.handleBadRequestError(res, 'A "role" query parameter is required.');
      }

      // 2. Call the service method, which now correctly returns an object
      const ids = await UserService.generateId(role);

      // 3. Send the object containing both the joinId and roleId back to the client
      return ResponseManager.sendSuccess(
          res, 
          ids, // The payload is the object { joinId, roleId }
          200, 
          'IDs generated successfully.'
      );

  } catch (err) {
      consoleManager.error(`Error in /generate-ids route: ${err.message}`);
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error generating IDs');
  }
});



router.get(
  '/referral-count/:userId',
  // authMiddleware, // Protect the route to ensure only logged-in users can access it.
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return ResponseManager.handleBadRequestError(res, 'User ID parameter is required.');
      }

      // Call the new service function to get the count.
      const count = await UserService.countReferredUsers(userId);

      // The service returns a number (0 or more), so we can directly send it.
      // The payload will look like: { "data": { "count": 5 } }
      return ResponseManager.sendSuccess(res, { count }, 200, 'Referred user count retrieved successfully.');

    } catch (err) {
      console.error(`Error in /referral-count/:userId route:`, err);

      // Handle the specific "User not found" error from the service.
      if (err.message === "User not found.") {
        return ResponseManager.sendError(res, 404, 'NOT_FOUND', err.message);
      }
      
      // Handle all other potential errors.
      const statusCode = err.statusCode || 500;
      return ResponseManager.sendError(res, statusCode, 'INTERNAL_ERROR', err.message);
    }
  }
);

router.get('/getUsersCount', async (req, res) => {
  try {
    const count = await UserService.getNumberOfUsers();

    return ResponseManager.sendSuccess(
      res, 
      { count: count-1 }, 
      200, 
      'Lead count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getUsersCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching user count'
    );
  }
});

router.get('/getTotalIncome', async (req, res) => {
  try {
    const totalIncome = await UserService.getTotalIncome();
    return ResponseManager.sendSuccess(
      res,
      { totalIncome },
      200,
      'Total income of all users retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error in /getTotalIncome route: ${err.message}`);
    return ResponseManager.sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'Error fetching total income'
    );
  }
});

// router.post('/generate-user', async(req,res)=>{
//   const data = req.body
//   try{
//     const joinId = UserService.generateId("MEM")
//     data.joinId = joinId
//     const user = new User(data);
//     console.log("---user---", user)
//     res.json(user)
//   }
//   catch(error){
//     console.log(error)
//   }
// })

export default router;