import express from "express"
import ContactService from "../../services/contact/contact_services.js"
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";

const router = express.Router();

// Create a new user
router.post('/addContact', async (req, res) => {
    try {
      const contact = await ContactService.createContact(req.body);
      // console.log(contact)
      return ResponseManager.sendSuccess(res, contact, 201, 'contact created successfully');
    } catch (err) {
      // console.log(err)
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating contact');
    }
  });


// Get a contact by ID
router.get('/getContact/:id', async (req, res) => {
  try {
    const contact = await ContactService.getContactById(req.params.id);
    if (contact) {
      ResponseManager.sendSuccess(res, contact, 200, 'contact retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'contact not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching contact');
  }
});

// Update a contact by ID
router.put('/updateContact/:id', async (req, res) => {
    try {
  
      const contact = await ContactService.updateContact(req.params.id, req.body);
      if (contact) {
        return ResponseManager.sendSuccess(res, contact, 200, 'contact updated successfully');
      } else {
        return ResponseManager.sendSuccess(res, [], 200, 'contact not found for update');
      }
    } catch (err) {
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating contact');
    }
  });

// Delete a contact by ID
router.delete('/deleteContact/:id', async (req, res) => {
  try {
    const contact = await ContactService.deleteContact(req.params.id);
    if (contact) {
      ResponseManager.sendSuccess(res, contact, 200, 'contact deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'contact not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting contact');
  }
});

router.delete('/deleteManyContacts', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseManager.handleBadRequestError(res, 'ids array is required');
    }
    const result = await ContactService.deleteManyContacts(ids);
    return ResponseManager.sendSuccess(res, result, 200, 'Contacts deleted successfully');
  } catch (err) { 
    consoleManager.error(`Error in /deleteManyContacts route: ${err.message}`);
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting contacts');
  }
});

// Get all contact
router.get('/getAllContact', async (req, res) => {
  try {
    const { searchQuery, page = 1, limit = 15 } = req.query;
    const result = await ContactService.getAllContacts(searchQuery, page, limit);

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res, 
      {
        contacts: result.contacts,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalContacts: result.totalContacts
      }, 
      200, 
      'contact retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching contact: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching contact'
    );
  }
});

router.get('/getContactsCount', async (req, res) => {
  try {
    const count = await ContactService.getNumberOfContacts();

    return ResponseManager.sendSuccess(
      res, 
      { count: count }, 
      200, 
      'contacts count retrieved successfully'
    );
  } catch (err) {
    // Use the managers you already have for logging and sending errors
    consoleManager.error(`Error in /getContactsCount route: ${err.message}`);
    return ResponseManager.sendError(
      res, 
      500, 
      'INTERNAL_ERROR', 
      'Error fetching contact count'
    );
  }
})

// // Toggle contact status
// router.put('/removeContact/:id', async (req, res) => {
//   try {
//     const contact = await ContactService.toggleUserStatus(req.params.id);
//     if (contact) {
//       ResponseManager.sendSuccess(res, contact, 200, 'contact status updated successfully');
//     } else {
//       ResponseManager.sendSuccess(res, [], 200, 'contact not found for status toggle');
//     }
//   } catch (err) {
//     ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling contact status');
//   }
// });

export default router;