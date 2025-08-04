# RMHSE Backend API Documentation

## Base URL
```
http://localhost:8000/v1
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "statusCode": 200,
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "statusCode": 400
}
```

---

## Authentication Routes (`/auth`)

### 1. User Login
- **Method:** `POST`
- **Endpoint:** `/auth/user/login`
- **Description:** Authenticate user and get JWT token
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      // ... other user fields (password excluded)
    }
  },
  "statusCode": 200,
  "message": "Login successful"
}
```

---

## User Routes (`/users`)

### 1. Get User by ID
- **Method:** `GET`
- **Endpoint:** `/users/getUser/:id`
- **Description:** Get user details by user ID
- **Parameters:** `id` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "role": "user",
    "limit": 25,
    "income": 0,
    // ... other user fields
  },
  "statusCode": 200,
  "message": "User retrieved successfully"
}
```

### 2. Update User
- **Method:** `PUT`
- **Endpoint:** `/users/updateUser/:id`
- **Description:** Update user details by user ID
- **Parameters:** `id` (path parameter)
- **Request Body:** Any user fields to update
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Updated Name",
    // ... updated user fields
  },
  "statusCode": 200,
  "message": "User updated successfully"
}
```

### 3. Delete User
- **Method:** `DELETE`
- **Endpoint:** `/users/deleteUser/:id`
- **Description:** Delete user by user ID
- **Parameters:** `id` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Deleted User",
    // ... deleted user data
  },
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

### 4. Delete Multiple Users
- **Method:** `DELETE`
- **Endpoint:** `/users/deleteManyUsers`
- **Description:** Delete multiple users by their IDs
- **Request Body:**
```json
{
  "ids": ["user_id_1", "user_id_2", "user_id_3"]
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3
  },
  "statusCode": 200,
  "message": "Users deleted successfully"
}
```

### 5. Get All Users
- **Method:** `GET`
- **Endpoint:** `/users/getAllUsers`
- **Description:** Get all users with pagination and filtering
- **Query Parameters:**
  - `searchQuery` (optional): Search by name or roleId
  - `status` (optional): Filter by user status
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 15): Items per page
  - `month` (optional): Filter by creation month
  - `year` (optional): Filter by creation year
- **Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "user",
        "latestRoleId": "role123",
        "registeredClientCount": 5
        // ... other user fields
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalUsers": 75
  },
  "statusCode": 200,
  "message": "Users retrieved successfully"
}
```

### 6. Get Current User Details
- **Method:** `GET`
- **Endpoint:** `/users/me`
- **Description:** Get current logged-in user's details
- **Authentication:** Required (JWT token)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Current User",
    "email": "user@example.com",
    // ... current user fields
  },
  "statusCode": 200,
  "message": "User details retrieved successfully"
}
```

### 7. Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/users/update-profile`
- **Description:** Update current user's profile
- **Authentication:** Required (JWT token)
- **Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword",
  "phoneNumber": "1234567890",
  "permanentAddress": "Permanent Address",
  "currentAddress": "Current Address",
  "dob": "1990-01-01",
  "gender": "Male",
  "emergencyNumber": "9876543210"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Updated Name",
    // ... updated profile fields
  },
  "statusCode": 200,
  "message": "User profile updated successfully"
}
```

### 8. Update Bank Details
- **Method:** `PUT`
- **Endpoint:** `/users/update-bank`
- **Description:** Update current user's bank details
- **Authentication:** Required (JWT token)
- **Request Body:**
```json
{
  "account_number": "1234567890123456",
  "Ifsc": "ABCD0001234",
  "upi_id": "user@upi"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "account_number": "1234567890123456",
    "Ifsc": "ABCD0001234",
    "upi_id": "user@upi"
    // ... other user fields
  },
  "statusCode": 200,
  "message": "Bank details updated successfully"
}
```

### 9. Update Documents
- **Method:** `PUT`
- **Endpoint:** `/users/update-document`
- **Description:** Update current user's document images
- **Authentication:** Required (JWT token)
- **Request Body:**
```json
{
  "pancard": "base64_image_string",
  "adharFront": "base64_image_string",
  "adharBack": "base64_image_string"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "pancard": "base64_image_string",
    "adharFront": "base64_image_string",
    "adharBack": "base64_image_string"
    // ... other user fields
  },
  "statusCode": 200,
  "message": "User documents updated successfully"
}
```

### 10. Get Users Count
- **Method:** `GET`
- **Endpoint:** `/users/getUsersCount`
- **Description:** Get total number of users (excluding admin)
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 74
  },
  "statusCode": 200,
  "message": "Lead count retrieved successfully"
}
```

### 11. Get Total Income
- **Method:** `GET`
- **Endpoint:** `/users/getTotalIncome`
- **Description:** Get total income of all users
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000
  },
  "statusCode": 200,
  "message": "Total income of all users retrieved successfully"
}
```

---

## Withdrawal Routes (`/withdrawals`)

### 1. Create Withdrawal
- **Method:** `POST`
- **Endpoint:** `/withdrawals/createWithdrawal`
- **Description:** Create a new withdrawal request
- **Request Body:**
```json
{
  "userId": "user_id",
  "amount": 1000
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "withdrawal_id",
    "userId": "user_id",
    "amount": 1000,
    "status": "pending",
    "createdOn": 1703123456789,
    "updatedOn": 1703123456789
  },
  "statusCode": 201,
  "message": "Withdrawal created successfully"
}
```

### 2. Get All Withdrawals
- **Method:** `GET`
- **Endpoint:** `/withdrawals/getAllWithdrawals`
- **Description:** Get all withdrawal requests (sorted by latest date)
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "withdrawal_id",
      "userId": "user_id",
      "amount": 1000,
      "status": "pending",
      "createdOn": 1703123456789,
      "updatedOn": 1703123456789
    }
  ],
  "statusCode": 200,
  "message": "All withdrawals retrieved successfully"
}
```

### 3. Update Withdrawal
- **Method:** `PUT`
- **Endpoint:** `/withdrawals/updateWithdrawal/:id`
- **Description:** Update withdrawal request status
- **Parameters:** `id` (path parameter)
- **Request Body:**
```json
{
  "status": "approved",
  "reason": "Request approved"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "withdrawal_id",
    "userId": "user_id",
    "amount": 1000,
    "status": "approved",
    "reason": "Request approved",
    "updatedOn": 1703123456789
  },
  "statusCode": 200,
  "message": "Withdrawal updated successfully"
}
```

### 4. Get Withdrawals by User ID
- **Method:** `GET`
- **Endpoint:** `/withdrawals/getWithdrawalsByUserId/:userId`
- **Description:** Get all withdrawal requests for a specific user
- **Parameters:** `userId` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "withdrawal_id",
      "userId": "user_id",
      "amount": 1000,
      "status": "pending",
      "createdOn": 1703123456789
    }
  ],
  "statusCode": 200,
  "message": "User withdrawals retrieved successfully"
}
```

### 5. Get Withdrawal by ID
- **Method:** `GET`
- **Endpoint:** `/withdrawals/getWithdrawalById/:id`
- **Description:** Get specific withdrawal request by ID
- **Parameters:** `id` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "withdrawal_id",
    "userId": "user_id",
    "amount": 1000,
    "status": "pending",
    "createdOn": 1703123456789,
    "updatedOn": 1703123456789
  },
  "statusCode": 200,
  "message": "Withdrawal retrieved successfully"
}
```

---

## Extension Routes (`/extends`)

### 1. Create Extension Request
- **Method:** `POST`
- **Endpoint:** `/extends/createExtend`
- **Description:** Create a new extension request
- **Request Body:**
```json
{
  "userId": "user_id"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "extend_id",
    "userId": "user_id",
    "status": "pending",
    "createdOn": 1703123456789,
    "updatedOn": 1703123456789
  },
  "statusCode": 201,
  "message": "Extension request created successfully"
}
```

### 2. Get All Extension Requests
- **Method:** `GET`
- **Endpoint:** `/extends/getAllExtends`
- **Description:** Get all extension requests (sorted by latest date)
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "extend_id",
      "userId": "user_id",
      "status": "pending",
      "createdOn": 1703123456789,
      "updatedOn": 1703123456789
    }
  ],
  "statusCode": 200,
  "message": "All extension requests retrieved successfully"
}
```

### 3. Update Extension Request
- **Method:** `PUT`
- **Endpoint:** `/extends/updateExtend/:id`
- **Description:** Update extension request status (automatically increases user limit by 25 when approved)
- **Parameters:** `id` (path parameter)
- **Request Body:**
```json
{
  "status": "approved",
  "reason": "Request approved"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "extend_id",
    "userId": "user_id",
    "status": "approved",
    "reason": "Request approved",
    "updatedOn": 1703123456789
  },
  "statusCode": 200,
  "message": "Extension request updated successfully"
}
```

### 4. Get Extension Requests by User ID
- **Method:** `GET`
- **Endpoint:** `/extends/getExtendsByUserId/:userId`
- **Description:** Get all extension requests for a specific user
- **Parameters:** `userId` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "extend_id",
      "userId": "user_id",
      "status": "pending",
      "createdOn": 1703123456789
    }
  ],
  "statusCode": 200,
  "message": "User extension requests retrieved successfully"
}
```

### 5. Get Extension Request by ID
- **Method:** `GET`
- **Endpoint:** `/extends/getExtendById/:id`
- **Description:** Get specific extension request by ID
- **Parameters:** `id` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "extend_id",
    "userId": "user_id",
    "status": "pending",
    "createdOn": 1703123456789,
    "updatedOn": 1703123456789
  },
  "statusCode": 200,
  "message": "Extension request retrieved successfully"
}
```

---

## Count Routes (`/count`)

### 1. Fetch Total Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalUsers`
- **Description:** Get total number of users
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 100
  },
  "statusCode": 200,
  "message": "Total users count retrieved successfully"
}
```

### 2. Fetch Total BM Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalBM`
- **Description:** Get total number of users with role "BM"
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 10
  },
  "statusCode": 200,
  "message": "Total BM users count retrieved successfully"
}
```

### 3. Fetch Total DIV Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalDIV`
- **Description:** Get total number of users with role "DIV"
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 15
  },
  "statusCode": 200,
  "message": "Total DIV users count retrieved successfully"
}
```

### 4. Fetch Total DIST Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalDIST`
- **Description:** Get total number of users with role "DIST"
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 20
  },
  "statusCode": 200,
  "message": "Total DIST users count retrieved successfully"
}
```

### 5. Fetch Total STAT Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalSTAT`
- **Description:** Get total number of users with role "STAT"
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 25
  },
  "statusCode": 200,
  "message": "Total STAT users count retrieved successfully"
}
```

### 6. Fetch Total Regular Users
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalRegularUser`
- **Description:** Get total number of users with role "user"
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 30
  },
  "statusCode": 200,
  "message": "Total regular users count retrieved successfully"
}
```

### 7. Fetch Total Income
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalIncome`
- **Description:** Get total income of all users
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000
  },
  "statusCode": 200,
  "message": "Total income retrieved successfully"
}
```

### 8. Fetch Total Withdrawal Requests
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalWithdrawalRequests`
- **Description:** Get total number of withdrawal requests
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 50
  },
  "statusCode": 200,
  "message": "Total withdrawal requests count retrieved successfully"
}
```

### 9. Fetch Total Extension Requests
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalExtendRequest`
- **Description:** Get total number of extension requests
- **Response:**
```json
{
  "success": true,
  "data": {
    "count": 25
  },
  "statusCode": 200,
  "message": "Total extend requests count retrieved successfully"
}
```

### 10. Fetch Total Income by User ID
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalIncomeByUserId/:userId`
- **Description:** Get total income for a specific user
- **Parameters:** `userId` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000
  },
  "statusCode": 200,
  "message": "User total income retrieved successfully"
}
```

### 11. Fetch Total Limits by User ID
- **Method:** `GET`
- **Endpoint:** `/count/fetchTotalLimitsByUserId/:userId`
- **Description:** Get total limit for a specific user
- **Parameters:** `userId` (path parameter)
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalLimit": 50
  },
  "statusCode": 200,
  "message": "User total limit retrieved successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request parameters |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Server internal error |
| `UNAUTHORIZED` | Authentication required |

---

## Authentication

For protected routes, include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Notes

1. All timestamps are in milliseconds since Unix epoch
2. Image fields (pancard, adharFront, adharBack) expect base64 encoded strings
3. When extension request status is set to "approved", user's limit is automatically increased by 25
4. All list endpoints support pagination where applicable
5. Search functionality is case-insensitive
6. All routes use consistent error handling and response formatting 